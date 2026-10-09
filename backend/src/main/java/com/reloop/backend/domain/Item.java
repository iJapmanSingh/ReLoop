package com.reloop.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private User owner;
    @Enumerated(EnumType.STRING)
    private Category category;
    private String brand;
    private String model;
    @Enumerated(EnumType.STRING)
    private ItemCondition itemCondition;
    private double weightKg;
    @Column(length = 1000)
    private String description;
    private String photoUrl;
    @Enumerated(EnumType.STRING)
    private Recommendation recommendation;
    @Column(columnDefinition = "TEXT")
    private String adviceJson; // headline, summary, hazards[], tips[]
    private Instant createdAt = Instant.now();

    public String getCode() { return "EW-" + (1000 + id); }
}


