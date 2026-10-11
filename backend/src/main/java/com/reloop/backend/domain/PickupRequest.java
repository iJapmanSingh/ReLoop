package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Getter @Setter @NoArgsConstructor
public class PickupRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Item item;
    @ManyToOne(optional = false)
    private User citizen;
    @ManyToOne
    private User collector; // null until ACCEPTED
    @Column(length = 500)
    private String address;
    private String landmark;
    private String city;
    private String pincode;
    private LocalDate preferredDate;
    private String timeWindow; // e.g. "10:00-13:00"
    private String contactNumber;
    private boolean consentShared;
    /** Citizen asked for the item to be collected by a delivery partner already on their route (proposed Amazon partnership). */
    @Column(columnDefinition = "boolean default false")
    private boolean viaDeliveryPartner;
    /** Credits granted to the citizen when this pickup reached RECYCLED (0 until then). */
    @Column(columnDefinition = "integer default 0")
    private int creditsAwarded;
    @Enumerated(EnumType.STRING)
    private PickupStatus status = PickupStatus.REQUESTED;
    private Instant createdAt = Instant.now();

    public String getCode() { return "PK-" + (2000 + id); }
}
