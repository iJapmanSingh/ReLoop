package com.reloop.backend.admin;

import com.reloop.backend.config.ApiException;
import com.reloop.backend.domain.*;
import com.reloop.backend.repo.PickupRequestRepository;
import com.reloop.backend.repo.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Admin tools for trust and safety: review collector applications and look at flagged pickups.
 * An admin compares the registration number a collector typed against the official registers
 * (for India: the CPCB e-waste portal) before approving. ReLoop does not check it automatically.
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminTrustController {
    private final UserRepository users;
    private final PickupRequestRepository pickups;

    /** The demo walkthrough depends on these two collectors, so they can't be rejected or suspended. */
    private static final Set<String> PROTECTED_DEMO = Set.of("DEMO-COL-0001", "DEMO-DLV-0001");

    public record CollectorRow(Long id, String name, String email, String phone, String city, String pincode,
                               String organization, String collectorType, String registrationNumber,
                               boolean deliveryPartner, boolean verified, String status, String note,
                               Instant verifiedAt, long completed, long active,
                               Double averageRating, long ratings, long flagged) {}

    public record ReviewRequest(@NotBlank String action, @Size(max = 500) String note) {}

    public record FlaggedRow(Long id, String code, String item, String citizen, String collector,
                             String status, String reason, Integer rating, Instant at) {}

    @GetMapping("/collectors")
    public List<CollectorRow> collectors() {
        return users.findByRoleOrderByNameAsc(Role.COLLECTOR).stream().map(this::row).toList();
    }

    @PatchMapping("/collectors/{id}/review")
    @Transactional
    public CollectorRow review(@PathVariable Long id, @Valid @RequestBody ReviewRequest r) {
        User c = users.findById(id)
                .filter(u -> u.getRole() == Role.COLLECTOR)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Collector not found"));
        String action = r.action().trim().toUpperCase();
        String note = r.note() == null ? "" : r.note().trim();
        if ((action.equals("REJECT") || action.equals("SUSPEND")) && PROTECTED_DEMO.contains(c.getRegistrationNumber()))
            throw new ApiException(HttpStatus.FORBIDDEN, "This is a core demo collector and can't be rejected or suspended");
        switch (action) {
            case "APPROVE" -> {
                c.setVerified(true);
                c.setVerificationStatus(VerificationStatus.APPROVED);
                c.setVerifiedAt(Instant.now());
                c.setVerificationNote(note.isEmpty() ? null : note);
            }
            case "REJECT" -> {
                requireNote(note, "Add a short reason so the collector knows what to fix");
                c.setVerified(false);
                c.setVerificationStatus(VerificationStatus.REJECTED);
                c.setVerificationNote(note);
            }
            case "SUSPEND" -> {
                requireNote(note, "Add a short reason for the suspension");
                c.setVerified(false);
                c.setVerificationStatus(VerificationStatus.SUSPENDED);
                c.setVerificationNote(note);
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Action must be APPROVE, REJECT or SUSPEND");
        }
        users.save(c);
        return row(c);
    }

    @GetMapping("/flagged")
    public List<FlaggedRow> flagged() {
        return pickups.findByFlaggedTrueOrderByCreatedAtDesc().stream()
                .map(p -> new FlaggedRow(p.getId(), p.getCode(),
                        p.getItem().getBrand() + " " + p.getItem().getModel(),
                        p.getCitizen().getName(),
                        p.getCollector() == null ? null : p.getCollector().getName(),
                        p.getStatus().name(), p.getFlagReason(), p.getRating(), p.getCreatedAt()))
                .toList();
    }

    private void requireNote(String note, String message) {
        if (note.length() < 3) throw new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    private CollectorRow row(User c) {
        List<PickupRequest> mine = pickups.findByCollectorOrderByCreatedAtDesc(c);
        long completed = mine.stream().filter(p -> p.getStatus() == PickupStatus.RECYCLED).count();
        long active = mine.stream()
                .filter(p -> p.getStatus() == PickupStatus.ACCEPTED || p.getStatus() == PickupStatus.PICKED_UP).count();
        long flagged = mine.stream().filter(p -> Boolean.TRUE.equals(p.getFlagged())).count();
        Double avg = pickups.averageRating(c);
        return new CollectorRow(c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getCity(), c.getPincode(),
                c.getOrganization(), c.getCollectorType(), c.getRegistrationNumber(),
                c.isDeliveryPartner(), c.isVerified(), VerificationStatus.of(c), c.getVerificationNote(),
                c.getVerifiedAt(), completed, active,
                avg == null ? null : Math.round(avg * 10) / 10.0, pickups.ratingCount(c), flagged);
    }
}
