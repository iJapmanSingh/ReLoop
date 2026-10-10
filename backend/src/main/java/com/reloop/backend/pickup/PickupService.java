package com.reloop.backend.pickup;

import com.reloop.backend.config.ApiException;
import com.reloop.backend.domain.*;
import com.reloop.backend.item.ItemService;
import com.reloop.backend.pickup.PickupDtos.*;
import com.reloop.backend.repo.PickupRequestRepository;
import com.reloop.backend.repo.StatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PickupService {
    private final PickupRequestRepository pickups;
    private final StatusHistoryRepository history;
    private final ItemService itemService;

    // ---------- citizen ----------

    @Transactional
    public PickupDto create(User citizen, CreatePickupRequest r) {
        if (!r.consentShared())
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Please agree to share your address and contact number with the assigned collector");
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
        p.setStatus(PickupStatus.REQUESTED);
        pickups.save(p);
        log(p, citizen);
        return view(p, citizen, true);
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
        return pickups.findByStatusAndCityIgnoreCaseOrderByCreatedAtDesc(PickupStatus.REQUESTED, c).stream()
                .filter(p -> pincode == null || pincode.isBlank() || p.getPincode().equals(pincode))
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
        p.setCollector(collector);
        p.setStatus(PickupStatus.ACCEPTED);
        pickups.save(p);
        log(p, collector);
        return view(p, collector, true);
    }

    @Transactional
    public PickupDto updateStatus(User collector, Long id, PickupStatus target) {
        PickupRequest p = lock(id);
        if (p.getCollector() == null || !p.getCollector().getId().equals(collector.getId())) throw notFound();
        if (target != PickupStatus.PICKED_UP && target != PickupStatus.RECYCLED)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use PICKED_UP or RECYCLED");
        if (!p.getStatus().canMoveTo(target))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Can't move from " + p.getStatus() + " to " + target + ". Stages can't be skipped.");
        p.setStatus(target);
        pickups.save(p);
        log(p, collector);
        return view(p, collector, true);
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
                ? new CollectorInfo("COL-" + String.format("%03d", c.getId()), c.getName(), c.getPhone(), c.getOrganization())
                : null;
        var timeline = withTimeline
                ? history.findByPickupOrderByChangedAtAsc(p).stream()
                        .map(h -> new TimelineEntry(h.getStatus(), h.getChangedAt())).toList()
                : null;
        return new PickupDto(p.getId(), p.getCode(), p.getStatus(), item, p.getCity(), p.getPincode(),
                p.getPreferredDate(), p.getTimeWindow(), p.getCreatedAt(), p.getCitizen().getName(),
                full ? p.getAddress() : null, full ? p.getLandmark() : null, full ? p.getContactNumber() : null,
                collector, timeline);
    }

    private boolean isAssigned(PickupRequest p, User u) {
        return p.getCollector() != null && p.getCollector().getId().equals(u.getId());
    }

    private PickupRequest lock(Long id) { return pickups.findForUpdate(id).orElseThrow(this::notFound); }

    private ApiException notFound() { return new ApiException(HttpStatus.NOT_FOUND, "Pickup not found"); }

    private void requireVerified(User u) {
        if (!u.isVerified())
            throw new ApiException(HttpStatus.FORBIDDEN, "Your collector account is awaiting verification");
    }

    private void log(PickupRequest p, User by) {
        StatusHistory h = new StatusHistory();
        h.setPickup(p);
        h.setStatus(p.getStatus());
        h.setChangedBy(by);
        history.save(h);
    }
}
