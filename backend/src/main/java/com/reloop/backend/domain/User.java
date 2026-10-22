package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users") // "user" is a reserved word in PostgreSQL
@Getter @Setter @NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String phone;
    private String city;
    private String pincode;
    // collectors only
    private String organization;
    private boolean verified;
    /** Collectors only: RECYCLER, REFURBISHER, AUTHORISED_COLLECTOR or DELIVERY_PARTNER (chosen at sign-up). */
    private String collectorType;
    /** Collectors only: registration / partner ID typed at sign-up. An admin checks it before approving. */
    private String registrationNumber;
    /** Collectors only: PENDING, APPROVED, REJECTED or SUSPENDED. Null on older rows, see VerificationStatus.of(). */
    private String verificationStatus;
    /** Admin's note on the latest review (reason for a rejection or suspension). */
    @Column(length = 500)
    private String verificationNote;
    private Instant verifiedAt;
    /** Collectors only: last-mile delivery partner who adds e-waste pickups to an existing delivery route (proposed Amazon partnership). */
    @Column(columnDefinition = "boolean default false")
    private boolean deliveryPartner;
    /** Citizens: current ReLoop credit balance (the ledger is CreditTransaction). */
    @Column(columnDefinition = "integer default 0")
    private int creditBalance;
}
