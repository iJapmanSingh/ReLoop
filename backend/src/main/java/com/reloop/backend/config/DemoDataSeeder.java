package com.reloop.backend.config;

import com.reloop.backend.credits.CreditService;
import com.reloop.backend.domain.*;
import com.reloop.backend.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Completed recycling records for the demo citizen so the admin dashboard and rewards page are not empty.
 * Runs only on an empty pickup table. Turn off with app.seed-demo=false.
 */
@Order(2)
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final ItemRepository items;
    private final PickupRequestRepository pickups;
    private final StatusHistoryRepository history;
    private final CreditTransactionRepository txs;
    private final CreditService credits;

    private record Demo(Category cat, String brand, String model, ItemCondition cond, double kg,
                        String city, String pin, int daysAgo, boolean viaPartner) {}

    @Override
    public void run(String... args) {
        if (pickups.count() > 0) return;
        User citizen = users.findByEmail("ananya.rao@example.com").orElse(null);
        User ravi = users.findByEmail("ravi@greenloop.in").orElse(null);
        User suresh = users.findByEmail("suresh@delivery-partner.demo").orElse(null);
        if (citizen == null || ravi == null || suresh == null) return;

        List<Demo> demos = List.of(
                new Demo(Category.LAPTOP_COMPUTER, "Dell", "Inspiron 15", ItemCondition.NOT_WORKING, 2.1, "Bengaluru", "560038", 150, false),
                new Demo(Category.PHONE_TABLET, "Samsung", "Galaxy J7", ItemCondition.DAMAGED, 0.2, "Bengaluru", "560038", 120, true),
                new Demo(Category.MONITOR_TV, "LG", "22MP48", ItemCondition.NOT_WORKING, 3.5, "Pune", "411001", 90, false),
                new Demo(Category.PRINTER_PERIPHERAL, "HP", "DeskJet 2331", ItemCondition.NOT_WORKING, 4.0, "Bengaluru", "560038", 60, true),
                new Demo(Category.SMALL_ELECTRONICS, "Mi", "Power Bank 2i", ItemCondition.DAMAGED, 0.3, "Hyderabad", "500001", 30, true));

        PickupStatus[] steps = {PickupStatus.REQUESTED, PickupStatus.ACCEPTED, PickupStatus.PICKED_UP, PickupStatus.RECYCLED};
        int totalPoints = 0;
        int seq = 0;
        for (Demo d : demos) {
            Instant t0 = Instant.now().minus(Duration.ofDays(d.daysAgo()));
            User collector = d.viaPartner() ? suresh : ravi;

            Item item = new Item();
            item.setOwner(citizen);
            item.setCategory(d.cat());
            item.setBrand(d.brand());
            item.setModel(d.model());
            item.setItemCondition(d.cond());
            item.setWeightKg(d.kg());
            item.setDescription("Demo record: " + d.brand() + " " + d.model());
            item.setRecommendation(Recommendation.RECYCLE);
            item.setCreatedAt(t0);
            items.save(item);

            int pts = credits.estimate(item) + (d.viaPartner() ? CreditService.PARTNER_BONUS : 0);
            PickupRequest p = new PickupRequest();
            p.setItem(item);
            p.setCitizen(citizen);
            p.setCollector(collector);
            p.setAddress("12, MG Road");
            p.setCity(d.city());
            p.setPincode(d.pin());
            p.setPreferredDate(LocalDate.ofInstant(t0, ZoneOffset.UTC));
            p.setTimeWindow("10:00-13:00");
            p.setContactNumber("+91 90000 05678");
            p.setConsentShared(true);
            p.setViaDeliveryPartner(d.viaPartner());
            p.setStatus(PickupStatus.RECYCLED);
            p.setCreditsAwarded(pts);
            seq++;
            p.setFacilityName("Demo Recycling Facility (sample record)");
            p.setReceiptNumber("DEMO-RCPT-" + (3000 + seq));
            p.setRating(5);
            p.setCreatedAt(t0);
            pickups.save(p);

            for (int s = 0; s < steps.length; s++) {
                StatusHistory h = new StatusHistory();
                h.setPickup(p);
                h.setStatus(steps[s]);
                h.setChangedBy(s == 0 ? citizen : collector);
                h.setChangedAt(t0.plus(Duration.ofHours(s * 4)));
                history.save(h);
            }

            CreditTransaction t = new CreditTransaction();
            t.setUser(citizen);
            t.setPickup(p);
            t.setType(CreditType.EARN);
            t.setPoints(pts);
            t.setDescription("Recycled " + item.getBrand() + " " + item.getModel()
                    + (d.viaPartner() ? " (delivery-handover bonus)" : ""));
            t.setCreatedAt(t0.plus(Duration.ofHours(12)));
            txs.save(t);
            totalPoints += pts;
        }

        citizen.setCreditBalance(totalPoints);
        users.save(citizen);
    }
}
