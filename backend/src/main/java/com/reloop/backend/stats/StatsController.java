package com.reloop.backend.stats;

import com.reloop.backend.domain.*;
import com.reloop.backend.repo.CreditTransactionRepository;
import com.reloop.backend.repo.PickupRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StatsController {
    private final PickupRequestRepository pickups;
    private final CreditTransactionRepository txs;
    @Value("${app.impact.co2-per-kg:3.0}")
    private double co2PerKg;

    public record Bucket(String name, double kg, long items) {}
    public record MonthKg(String month, double kg) {}
    public record Recent(String code, String item, String citizen, Instant at, double kg, double co2) {}
    public record AdminStats(double totalKg, double totalCo2, long itemsRecycled, long totalRequests,
                             Map<String, Long> statusCounts, List<MonthKg> monthly,
                             List<Bucket> byCity, List<Bucket> byDevice, List<Recent> recent,
                             long partnerPickups, long creditsIssued, long creditsRedeemed) {}

    @GetMapping("/stats")
    public AdminStats stats() {
        List<PickupRequest> all = pickups.findAll();
        List<PickupRequest> done = all.stream().filter(p -> p.getStatus() == PickupStatus.RECYCLED).toList();
        double kg = done.stream().mapToDouble(p -> p.getItem().getWeightKg()).sum();

        Map<String, Long> counts = new LinkedHashMap<>();
        for (PickupStatus s : List.of(PickupStatus.REQUESTED, PickupStatus.ACCEPTED, PickupStatus.PICKED_UP, PickupStatus.RECYCLED))
            counts.put(s.name(), all.stream().filter(p -> p.getStatus() == s).count());
        long total = counts.values().stream().mapToLong(Long::longValue).sum();

        List<MonthKg> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now(ZoneOffset.UTC).minusMonths(i);
            double m = done.stream()
                    .filter(p -> YearMonth.from(p.getCreatedAt().atZone(ZoneOffset.UTC)).equals(ym))
                    .mapToDouble(p -> p.getItem().getWeightKg()).sum();
            monthly.add(new MonthKg(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), round(m)));
        }

        List<Recent> recent = done.stream()
                .sorted(Comparator.comparing(PickupRequest::getCreatedAt).reversed()).limit(5)
                .map(p -> new Recent(p.getCode(), p.getItem().getBrand() + " " + p.getItem().getModel(),
                        p.getCitizen().getName(), p.getCreatedAt(), p.getItem().getWeightKg(),
                        round(p.getItem().getWeightKg() * co2PerKg)))
                .toList();

        long partnerPickups = all.stream()
                .filter(p -> p.getStatus() != PickupStatus.CANCELLED && p.isViaDeliveryPartner()).count();
        long creditsIssued = all.stream().mapToLong(PickupRequest::getCreditsAwarded).sum();
        long creditsRedeemed = txs.findAll().stream()
                .filter(t -> t.getType() == CreditType.REDEEM).mapToLong(t -> -t.getPoints()).sum();

        return new AdminStats(round(kg), round(kg * co2PerKg), done.size(), total, counts, monthly,
                buckets(done, p -> title(p.getCity())), buckets(done, p -> p.getItem().getCategory().name()), recent,
                partnerPickups, creditsIssued, creditsRedeemed);
    }

    private List<Bucket> buckets(List<PickupRequest> done, Function<PickupRequest, String> key) {
        return done.stream().collect(Collectors.groupingBy(key)).entrySet().stream()
                .map(e -> new Bucket(e.getKey(),
                        round(e.getValue().stream().mapToDouble(p -> p.getItem().getWeightKg()).sum()),
                        e.getValue().size()))
                .sorted(Comparator.comparingDouble(Bucket::kg).reversed()).toList();
    }

    private static String title(String s) {
        if (s == null || s.isBlank()) return "Unknown";
        return Arrays.stream(s.trim().toLowerCase().split("\\s+"))
                .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "));
    }

    private double round(double v) { return Math.round(v * 10) / 10.0; }
}
