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
            boolean consentShared,
            boolean viaDeliveryPartner) {}

    /**
     * handoverCode is needed for PICKED_UP (the citizen reads it out at the door);
     * facilityName and receiptNumber are needed for RECYCLED (where the device was dropped off).
     */
    public record StatusUpdate(@NotNull PickupStatus status, @Size(max = 20) String handoverCode,
                               @Size(max = 100) String facilityName, @Size(max = 100) String receiptNumber) {}

    /** Citizen feedback after RECYCLED. reportProblem flags the pickup for an admin to review. */
    public record FeedbackRequest(@NotNull @Min(1) @Max(5) Integer rating,
                                  @Size(max = 500) String comment, boolean reportProblem) {}

    public record ItemSummary(Long id, String code, Category category, String brand, String model,
                              double weightKg, ItemCondition condition, String description,
                              Recommendation recommendation) {}

    /** What a citizen (or the assigned collector) may see about the collector. Rating fields are null in list views. */
    public record CollectorInfo(String code, String name, String phone, String organization, boolean deliveryPartner,
                                String registrationNumber, String collectorType, boolean verified,
                                Double averageRating, long ratingCount) {}

    /** Is a verified delivery partner active in this pincode? network is the partner organisation name. */
    public record PartnerAvailability(boolean available, int partners, String network, int bonusCredits) {}

    public record TimelineEntry(PickupStatus status, Instant at) {}

    /**
     * address / landmark / contactNumber are null unless the viewer is the citizen who owns the pickup
     * or the collector assigned to it. collector is null until ACCEPTED. timeline is null in list views.
     * handoverCode is only sent to the owning citizen while the pickup is ACCEPTED. facilityName / receiptNumber
     * are sent to the citizen and the assigned collector once RECYCLED. flagged is only sent to the citizen and admins.
     * handoverCodeRequired tells the UI whether the collector must enter a code (false for pickups accepted before codes existed).
     */
    public record PickupDto(Long id, String code, PickupStatus status, ItemSummary item,
                            String city, String pincode, LocalDate preferredDate, String timeWindow,
                            Instant createdAt, String citizenName,
                            String address, String landmark, String contactNumber,
                            CollectorInfo collector, List<TimelineEntry> timeline,
                            boolean viaDeliveryPartner, int creditsAwarded, int estimatedCredits,
                            String handoverCode, String facilityName, String receiptNumber,
                            Integer rating, String feedback, boolean flagged, boolean handoverCodeRequired) {}
}
