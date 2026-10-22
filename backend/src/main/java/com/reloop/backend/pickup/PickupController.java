package com.reloop.backend.pickup;

import com.reloop.backend.domain.User;
import com.reloop.backend.pickup.PickupDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pickups")
@RequiredArgsConstructor
public class PickupController {
    private final PickupService service;

    // citizen
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CITIZEN')")
    public PickupDto create(@AuthenticationPrincipal User u, @Valid @RequestBody CreatePickupRequest r) {
        return service.create(u, r);
    }

    /** Lets the request form offer "hand over with your next delivery" only where a partner serves the pincode. */
    @GetMapping("/partner-availability")
    @PreAuthorize("hasRole('CITIZEN')")
    public PartnerAvailability partnerAvailability(@RequestParam String pincode) { return service.partnerAvailability(pincode); }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CITIZEN')")
    public List<PickupDto> mine(@AuthenticationPrincipal User u) { return service.mine(u); }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CITIZEN')")
    public PickupDto cancel(@AuthenticationPrincipal User u, @PathVariable Long id) { return service.cancel(u, id); }

    /** Citizen rates a recycled pickup and can report a problem for an admin to review. */
    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CITIZEN')")
    public PickupDto feedback(@AuthenticationPrincipal User u, @PathVariable Long id, @Valid @RequestBody FeedbackRequest r) {
        return service.feedback(u, id, r);
    }

    // collector
    @GetMapping("/available")
    @PreAuthorize("hasRole('COLLECTOR')")
    public List<PickupDto> available(@AuthenticationPrincipal User u,
                                     @RequestParam(required = false) String city,
                                     @RequestParam(required = false) String pincode) {
        return service.available(u, city, pincode);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('COLLECTOR')")
    public List<PickupDto> assigned(@AuthenticationPrincipal User u) { return service.assigned(u); }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('COLLECTOR')")
    public PickupDto accept(@AuthenticationPrincipal User u, @PathVariable Long id) { return service.accept(u, id); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('COLLECTOR')")
    public PickupDto status(@AuthenticationPrincipal User u, @PathVariable Long id, @Valid @RequestBody StatusUpdate s) {
        return service.updateStatus(u, id, s);
    }

    // any logged-in user; the service decides what this viewer may see
    @GetMapping("/{id}")
    public PickupDto get(@AuthenticationPrincipal User u, @PathVariable Long id) { return service.get(u, id); }
}
