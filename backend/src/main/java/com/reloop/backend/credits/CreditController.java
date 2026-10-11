package com.reloop.backend.credits;

import com.reloop.backend.credits.CreditDtos.*;
import com.reloop.backend.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/credits")
@PreAuthorize("hasRole('CITIZEN')")
@RequiredArgsConstructor
public class CreditController {
    private final CreditService service;

    @GetMapping
    public CreditsDto summary(@AuthenticationPrincipal User u) { return service.summary(u); }

    @PostMapping("/redeem")
    public CreditsDto redeem(@AuthenticationPrincipal User u, @Valid @RequestBody RedeemRequest r) {
        return service.redeem(u, r.rewardId());
    }
}
