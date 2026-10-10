package com.reloop.backend.item;

import com.reloop.backend.advice.Advice;
import com.reloop.backend.domain.Category;
import com.reloop.backend.domain.ItemCondition;
import com.reloop.backend.domain.PickupStatus;
import com.reloop.backend.domain.Recommendation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ItemDtos {
    private ItemDtos() {}

    public record ItemRequest(
            @NotNull Category category,
            @NotBlank String brand,
            @NotBlank String model,
            @NotNull ItemCondition condition,
            @Positive(message = "must be greater than 0") double weightKg,
            @NotBlank @Size(max = 1000) String description,
            String photoUrl) {}

    /** status/pickupId/pickupCode come from the item's latest pickup (null if none yet). */
    public record ItemDto(Long id, String code, Category category, String brand, String model,
                          ItemCondition condition, double weightKg, String description, String photoUrl,
                          Recommendation recommendation, Advice advice,
                          PickupStatus status, Long pickupId, String pickupCode, Instant createdAt) {}
}
