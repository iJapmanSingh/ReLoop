package com.reloop.backend.credits;

import com.reloop.backend.config.ApiException;
import com.reloop.backend.credits.CreditDtos.*;
import com.reloop.backend.domain.*;
import com.reloop.backend.repo.CreditTransactionRepository;
import com.reloop.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * ReLoop credits: citizens earn them when a pickup reaches RECYCLED and redeem them for rewards.
 * Redemption is a demo: it issues a voucher code, it does not talk to a real voucher provider.
 * Amazon is treated as a proposed partnership in UI text and comments.
 */
@Service
@RequiredArgsConstructor
public class CreditService {
    /** Extra credits when the item was handed over to a delivery partner already on their route. */
    public static final int PARTNER_BONUS = 25;
    private static final int POINTS_PER_KG = 10;

    private static final List<RewardDto> REWARDS = List.of(
            new RewardDto("AMZ-50", "₹50 Amazon voucher (demo)", "Demo reward for prototype testing. Proposed partner reward.", 250),
            new RewardDto("AMZ-100", "₹100 Amazon voucher (demo)", "Demo reward for prototype testing. Proposed partner reward.", 500),
            new RewardDto("AMZ-250", "₹250 Amazon voucher (demo)", "Demo reward for prototype testing. Proposed partner reward.", 1200));

    private final UserRepository users;
    private final CreditTransactionRepository txs;

    /** Credits an item earns when recycled, before any delivery-partner bonus. */
    public int estimate(Item item) {
        if (item == null) return 0;
        return base(item.getCategory()) + (int) Math.round(item.getWeightKg() * POINTS_PER_KG);
    }

    private int base(Category c) {
        if (c == null) return 40;
        return switch (c) {
            case PHONE_TABLET -> 100;
            case LAPTOP_COMPUTER -> 200;
            case MONITOR_TV -> 150;
            case PRINTER_PERIPHERAL -> 80;
            case LARGE_APPLIANCE -> 250;
            case SMALL_ELECTRONICS -> 40;
        };
    }

    /** Called once when a pickup becomes RECYCLED. Safe to call twice: it never awards twice. */
    @Transactional
    public int award(PickupRequest p) {
        if (p.getCreditsAwarded() > 0) return p.getCreditsAwarded();
        int pts = estimate(p.getItem()) + (p.isViaDeliveryPartner() ? PARTNER_BONUS : 0);
        User citizen = users.findForUpdate(p.getCitizen().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Citizen not found"));
        citizen.setCreditBalance(citizen.getCreditBalance() + pts);
        users.save(citizen);
        p.setCreditsAwarded(pts);

        CreditTransaction t = new CreditTransaction();
        t.setUser(citizen);
        t.setPickup(p);
        t.setType(CreditType.EARN);
        t.setPoints(pts);
        t.setDescription("Recycled " + p.getItem().getBrand() + " " + p.getItem().getModel()
                + (p.isViaDeliveryPartner() ? " (delivery-handover bonus)" : ""));
        txs.save(t);
        return pts;
    }

    @Transactional(readOnly = true)
    public CreditsDto summary(User u) {
        User fresh = users.findById(u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        List<CreditTransaction> list = txs.findByUserOrderByCreatedAtDesc(fresh);
        int earned = list.stream().filter(t -> t.getType() == CreditType.EARN).mapToInt(CreditTransaction::getPoints).sum();
        int redeemed = list.stream().filter(t -> t.getType() == CreditType.REDEEM).mapToInt(t -> -t.getPoints()).sum();
        return new CreditsDto(fresh.getCreditBalance(), earned, redeemed, REWARDS,
                list.stream().map(this::toDto).toList());
    }

    @Transactional
    public CreditsDto redeem(User u, String rewardId) {
        RewardDto reward = REWARDS.stream().filter(r -> r.id().equals(rewardId)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown reward"));
        User fresh = users.findForUpdate(u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (fresh.getCreditBalance() < reward.cost())
            throw new ApiException(HttpStatus.CONFLICT,
                    "You need " + (reward.cost() - fresh.getCreditBalance()) + " more credits for this reward");
        fresh.setCreditBalance(fresh.getCreditBalance() - reward.cost());
        users.save(fresh);

        CreditTransaction t = new CreditTransaction();
        t.setUser(fresh);
        t.setType(CreditType.REDEEM);
        t.setPoints(-reward.cost());
        t.setDescription("Redeemed " + reward.title());
        t.setVoucherCode("RLP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase());
        txs.save(t);
        return summary(fresh);
    }

    private TransactionDto toDto(CreditTransaction t) {
        return new TransactionDto(t.getId(), t.getType(), t.getPoints(), t.getDescription(), t.getVoucherCode(),
                t.getPickup() == null ? null : t.getPickup().getCode(), t.getCreatedAt());
    }
}
