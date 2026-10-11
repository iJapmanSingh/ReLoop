package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** One line in a citizen's credit ledger: EARN is positive points, REDEEM is negative. */
@Entity
@Getter @Setter @NoArgsConstructor
public class CreditTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne
    private PickupRequest pickup; // set for EARN, null for REDEEM

    @Enumerated(EnumType.STRING)
    private CreditType type;

    private int points;

    private String description;

    private String voucherCode; // REDEEM only

    private Instant createdAt = Instant.now();
}
