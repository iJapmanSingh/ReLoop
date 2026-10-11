package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    /** Collectors only: last-mile delivery partner who adds e-waste pickups to an existing delivery route (proposed Amazon partnership). */
    @Column(columnDefinition = "boolean default false")
    private boolean deliveryPartner;
    /** Citizens: current ReLoop credit balance (the ledger is CreditTransaction). */
    @Column(columnDefinition = "integer default 0")
    private int creditBalance;
}
