package com.reloop.backend.pickup;

import com.reloop.backend.config.ApiException;
import com.reloop.backend.credits.CreditService;
import com.reloop.backend.domain.*;
import com.reloop.backend.item.ItemService;
import com.reloop.backend.pickup.PickupDtos.*;
import com.reloop.backend.repo.PickupRequestRepository;
import com.reloop.backend.repo.StatusHistoryRepository;
import com.reloop.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PickupService {
    private final PickupRequestRepository pickups;
    private final StatusHistoryRepository history;
    private final ItemService itemService;
    private final UserRepository users;
    private final CreditService credits;

    private static final int MAX_OPEN_PICKUPS = 5;
    private static final int MAX_WRONG_CODES = 5;
    private static final List<PickupStatus> OPEN =
            List.of(PickupStatus.REQUESTED, PickupStatus.ACCEPTED, PickupStatus.PICKED_UP);
    private static final SecureRandom RANDOM = new SecureRandom();

    // ---------- citizen ----------

    @Transactional
    public PickupDto create(User citizen, CreatePickupRequest r) {
        if (!r.consentShared())
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Please agree to share your address and contact number with the assigned collector");
        if (pickups.countByCitizenAndStatusIn(citizen, OPEN) >= MAX_OPEN_PICKUPS)
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "You already have " + MAX_OPEN_PICKUPS
                    + " open pickups. Please wait for one to finish before requesting another");
        Item item = itemService.owned(citizen, r.itemId());
        pickups.findFirstByItemOrderByCreatedAtDesc(item)
                .filter(p -> p.getStatus() != PickupStatus.CANCELLED)
                .ifPresent(p -> { throw new ApiException(HttpStatus.CONFLICT, "This item already has a pickup request"); });

        PickupRequest p = new PickupRequest();
        p.setItem(item);
        p.setCitizen(citizen);
        p.setAddress(r.address().trim());
        p.setLandmark(r.landmark());
        p.setCity(r.city().trim());
        p.setPincode(r.pincode());
        p.setPreferredDate(r.preferredDate());
        p.setTimeWindow(r.timeWindow());
        p.setContactNumber(r.contactNumber());
        p.setConsentShared(true);
        // only honour the delivery-partner choice if a verified partner actually serves this pincode
        p.setViaDeliveryPartner(r.viaDeliveryPartner() && !partnersIn(r.pincode()).isEmpty());
        p.setStatus(PickupStatus.REQUESTED);
        pickups.save(p);
        log(p, citizen);
        return view(p, citizen, true);
    }

    public PartnerAvailability partnerAvailability(String pincode) {
        List<User> partners = partnersIn(pincode);
        String network = partners.isEmpty() ? null : partners.get(0).getOrganization();
        return new PartnerAvailability(!partners.isEmpty(), partners.size(), network, CreditService.PARTNER_BONUS);
    }

    private List<User> partnersIn(String pincode) {
        return users.findByRoleAndDeliveryPartnerTrueAndVerifiedTrueAndPincode(Role.COLLECTOR, pincode);
    }

    public List<PickupDto> mine(User citizen) {
        return pickups.findByCitizenOrderByCreatedAtDesc(citizen).stream().map(p -> view(p, citizen, false)).toList();
    }

    @Transactional
    public PickupDto cancel(User citizen, Long id) {
        PickupRequest p = lock(id);
        if (!p.getCitizen().getId().equals(citizen.getId())) throw notFound();
        if (!p.getStatus().canMoveTo(PickupStatus.CANCELLED))
            throw new ApiException(HttpStatus.CONFLICT, "A pickup can only be cancelled while it is REQUESTED");
        p.setStatus(PickupStatus.CANCELLED);
        pickups.save(p);
        log(p, citizen);
        return view(p, citizen, true);
    }

    // ---------- collector ----------

    public List<PickupDto> available(User collector, String city, String pincode) {
        requireVerified(collector);
        String c = (city == null || city.isBlank()) ? collector.getCity() : city;
        // a delivery partner's service area is their delivery route, so pin the filter to their pincode
        String pin = (collector.isDeliveryPartner() && collector.getPincode() != null) ? collector.getPincode() : pincode;
        return pickups.findByStatusAndCityIgnoreCaseOrderByCreatedAtDesc(PickupStatus.REQUESTED, c).stream()
                .filter(p -> pin == null || pin.isBlank() || p.getPincode().equals(pin))
                // stable sort: requests that asked for a delivery partner come first for partners
                .sorted(Comparator.comparing((PickupRequest p) -> collector.isDeliveryPartner() && !p.isViaDeliveryPartner()))
                .map(p -> view(p, collector, false)).toList();
    }

    public List<PickupDto> assigned(User collector) {
        return pickups.findByCollectorOrderByCreatedAtDesc(collector).stream()
                .map(p -> view(p, collector, false)).toList();
    }

    @Transactional
    public PickupDto accept(User collector, Long id) {
        requireVerified(collector);
        PickupRequest p = lock(id);
        if (p.getStatus() != PickupStatus.REQUESTED)
            throw new ApiException(HttpStatus.CONFLICT, "This request is no longer available");
        if (!p.getCity().equalsIgnoreCase(collector.getCity()))
            throw new ApiException(HttpStatus.FORBIDDEN, "This request is outside your service area");
        if (collector.isDeliveryPartner() && collector.getPincode() != null
                && !collector.getPincode().equals(p.getPincode()))
            throw new ApiException(HttpStatus.FORBIDDEN, "This request is outside your delivery route");
        p.setCollector(collector);
        p.setStatus(PickupStatus.ACCEPTED);
        p.setHandoverCode(newHandoverCode());
        p.setCodeAttempts(0);
        pickups.save(p);
        log(p, collector);
        return view(p, collector, true);
    }

    /**
     * noRollbackFor: a wrong handover code must still be counted, so the failed attempt is saved
     * even though the request ends with an error.
     */
    @Transactional(noRollbackFor = ApiException.class)
    public PickupDto updateStatus(User collector, Long id, StatusUpdate u) {
        requireVerified(collector);
        PickupStatus target = u.status();
        PickupRequest p = lock(id);
        if (p.getCollector() == null || !p.getCollector().getId().equals(collector.getId())) throw notFound();
        if (target != PickupStatus.PICKED_UP && target != PickupStatus.RECYCLED)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use PICKED_UP or RECYCLED");
        if (!p.getStatus().canMoveTo(target))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Can't move from " + p.getStatus() + " to " + target + ". Stages can't be skipped.");
        if (target == PickupStatus.PICKED_UP) checkHandoverCode(p, u.handoverCode());
        if (target == PickupStatus.RECYCLED) {
            String facility = clean(u.facilityName());
            String receipt = clean(u.receiptNumber());
            if (facility == null || receipt == null)
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Enter the facility that received the device and the receipt number before marking it recycled");
            p.setFacilityName(facility);
            p.setReceiptNumber(receipt);
            credits.award(p); // citizen earns credits only at RECYCLED
        }
        p.setStatus(target);
        pickups.save(p);
        log(p, collector);
        return view(p, collector, true);
    }

    // ---------- citizen feedback ----------

    @Transactional
    public PickupDto feedback(User citizen, Long id, FeedbackRequest r) {
        PickupRequest p = lock(id);
        if (!p.getCitizen().getId().equals(citizen.getId())) throw notFound();
        if (p.getStatus() != PickupStatus.RECYCLED)
            throw new ApiException(HttpStatus.CONFLICT, "You can rate a pickup once it has been recycled");
        if (p.getRating() != null)
            throw new ApiException(HttpStatus.CONFLICT, "You have already rated this pickup");
        p.setRating(r.rating());
        String comment = r.comment() == null ? "" : r.comment().trim();
        p.setFeedback(comment.isEmpty() ? null : comment);
        if (r.reportProblem()) {
            p.setFlagged(true);
            p.setFlagReason(comment.isEmpty() ? "Citizen reported a problem with this pickup" : comment);
        }
        pickups.save(p);
        return view(p, citizen, true);
    }

    // ---------- shared ----------

    public PickupDto get(User viewer, Long id) {
        PickupRequest p = pickups.findById(id).orElseThrow(this::notFound);
        boolean owner = p.getCitizen().getId().equals(viewer.getId());
        boolean assigned = isAssigned(p, viewer);
        boolean browsing = viewer.getRole() == Role.COLLECTOR && p.getStatus() == PickupStatus.REQUESTED;
        if (!owner && !assigned && !browsing && viewer.getRole() != Role.ADMIN) throw notFound();
        return view(p, viewer, true);
    }

    private PickupDto view(PickupRequest p, User viewer, boolean withTimeline) {
        boolean owner = p.getCitizen().getId().equals(viewer.getId());
        boolean assigned = isAssigned(p, viewer);
        boolean full = owner || assigned; // address + phone only for these two people
        Item i = p.getItem();
        var item = new ItemSummary(i.getId(), i.getCode(), i.getCategory(), i.getBrand(), i.getModel(),
                i.getWeightKg(), i.getItemCondition(), i.getDescription(), i.getRecommendation());
        User c = p.getCollector();
        CollectorInfo collector = (c != null && full)
                ? new CollectorInfo("COL-" + String.format("%03d", c.getId()), c.getName(), c.getPhone(), c.getOrganization(),
                        c.isDeliveryPartner(), c.getRegistrationNumber(), c.getCollectorType(), c.isVerified(),
                        withTimeline ? round1(pickups.averageRating(c)) : null,
                        withTimeline ? pickups.ratingCount(c) : 0L)
                : null;
        boolean recycled = p.getStatus() == PickupStatus.RECYCLED;
        var timeline = withTimeline
                ? history.findByPickupOrderByChangedAtAsc(p).stream()
                        .map(h -> new TimelineEntry(h.getStatus(), h.getChangedAt())).toList()
                : null;
        return new PickupDto(p.getId(), p.getCode(), p.getStatus(), item, p.getCity(), p.getPincode(),
                p.getPreferredDate(), p.getTimeWindow(), p.getCreatedAt(), p.getCitizen().getName(),
                full ? p.getAddress() : null, full ? p.getLandmark() : null, full ? p.getContactNumber() : null,
                collector, timeline, p.isViaDeliveryPartner(), p.getCreditsAwarded(),
                credits.estimate(i) + (p.isViaDeliveryPartner() ? CreditService.PARTNER_BONUS : 0),
                owner && p.getStatus() == PickupStatus.ACCEPTED ? p.getHandoverCode() : null,
                full && recycled ? p.getFacilityName() : null,
                full && recycled ? p.getReceiptNumber() : null,
                full ? p.getRating() : null, full ? p.getFeedback() : null,
                (owner || viewer.getRole() == Role.ADMIN) && Boolean.TRUE.equals(p.getFlagged()),
                p.getHandoverCode() != null);
    }

    private static String newHandoverCode() { return String.format("%06d", RANDOM.nextInt(1_000_000)); }

    /** Pickups accepted before handover codes existed have no code, so they are let through. */
    private void checkHandoverCode(PickupRequest p, String entered) {
        String expected = p.getHandoverCode();
        if (expected == null) return;
        if (entered != null && expected.equals(entered.trim())) return;
        int attempts = (p.getCodeAttempts() == null ? 0 : p.getCodeAttempts()) + 1;
        p.setCodeAttempts(attempts);
        if (attempts >= MAX_WRONG_CODES && !Boolean.TRUE.equals(p.getFlagged())) {
            p.setFlagged(true);
            p.setFlagReason("Wrong handover code entered " + attempts + " times. Needs admin review.");
        }
        pickups.save(p);
        throw new ApiException(HttpStatus.FORBIDDEN,
                "That handover code is not correct. Ask the citizen to read it from their ReLoop app.");
    }

    private static String clean(String s) {
        if (s == null) return null;
        String t = s.trim();
        if (t.length() < 2) return null;
        return t.length() > 100 ? t.substring(0, 100) : t;
    }

    private static Double round1(Double v) { return v == null ? null : Math.round(v * 10) / 10.0; }

    private boolean isAssigned(PickupRequest p, User u) {
        return p.getCollector() != null && p.getCollector().getId().equals(u.getId());
    }

    private PickupRequest lock(Long id) { return pickups.findForUpdate(id).orElseThrow(this::notFound); }

    private ApiException notFound() { return new ApiException(HttpStatus.NOT_FOUND, "Pickup not found"); }

    private void requireVerified(User u) {
        if (!u.isVerified())
            throw new ApiException(HttpStatus.FORBIDDEN, "Your collector account is not approved yet. An admin needs to verify your registration first");
    }

    private void log(PickupRequest p, User by) {
        StatusHistory h = new StatusHistory();
        h.setPickup(p);
        h.setStatus(p.getStatus());
        h.setChangedBy(by);
        history.save(h);
    }
}
