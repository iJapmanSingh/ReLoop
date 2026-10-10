package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor
public class StatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private PickupRequest pickup;
    @Enumerated(EnumType.STRING)
    private PickupStatus status;
    @ManyToOne
    private User changedBy;
    private Instant changedAt = Instant.now();
}
