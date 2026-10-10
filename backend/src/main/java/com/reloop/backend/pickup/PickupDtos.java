package com.reloop.backend.pickup;

import com.reloop.backend.domain.*;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class PickupDtos {
    private PickupDtos() {}

    public record CreatePickupRequest(
            @NotNull Long itemId,
            @NotBlank @Size(max = 500) String address,
            String landmark,
            @NotBlank String city,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "must be a 6-digit pincode") String pincode,
            @NotNull @FutureOrPresent LocalDate preferredDate,
            @NotBlank String timeWindow,
            @NotBlank String contactNumber,
            boolean consentShared) {}

    public record StatusUpdate(@NotNull PickupStatus status) {}

    public record ItemSummary(Long id, String code, Category category, String brand, String model,
                              double weightKg, ItemCondition condition, String description,
                              Recommendation recommendation) {}

    public record CollectorInfo(String code, String name, String phone, String organization) {}

    public record TimelineEntry(PickupStatus status, Instant at) {}

    /**
     * address / landmark / contactNumber are null unless the viewer is the citizen who owns the pickup
     * or the collector assigned to it. collector is null until ACCEPTED. timeline is null in list views.
     */
    public record PickupDto(Long id, String code, PickupStatus status, ItemSummary item,
                            String city, String pincode, LocalDate preferredDate, String timeWindow,
                            Instant createdAt, String citizenName,
                            String address, String landmark, String contactNumber,
                            CollectorInfo collector, List<TimelineEntry> timeline) {}
}
