package com.reloop.backend.credits;

import com.reloop.backend.domain.CreditType;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public final class CreditDtos {
    private CreditDtos() {}

    public record RewardDto(String id, String title, String description, int cost) {}

    public record TransactionDto(Long id, CreditType type, int points, String description,
                                 String voucherCode, String pickupCode, Instant at) {}

    public record CreditsDto(int balance, int totalEarned, int totalRedeemed,
                             List<RewardDto> rewards, List<TransactionDto> transactions) {}

    public record RedeemRequest(@NotBlank String rewardId) {}
}
