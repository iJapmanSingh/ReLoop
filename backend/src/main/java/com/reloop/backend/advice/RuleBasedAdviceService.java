package com.reloop.backend.advice;

import com.reloop.backend.advice.Advice.Hazard;
import com.reloop.backend.domain.Category;
import com.reloop.backend.domain.Item;
import com.reloop.backend.domain.ItemCondition;
import com.reloop.backend.domain.Recommendation;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RuleBasedAdviceService implements AdviceService {

    @Override
    public Advice advise(Item item) {
        Category cat = item.getCategory();
        ItemCondition cond = item.getItemCondition();
        Recommendation rec = recommend(cat, cond);

        List<Hazard> hazards = new ArrayList<>(hazardsFor(cat));
        if (cond == ItemCondition.DAMAGED && hasBattery(cat)) {
            hazards.add(new Hazard("Damaged battery risk",
                    "A swollen, hot or leaking battery can ignite. Don't charge it or handle it more than needed."));
        }
        String summary = "Because this " + label(cat) + " is " + condText(cond) + ", " + route(rec)
                + " is the suggested route. A trained collector or technician may reassess before processing.";

        return new Advice(headline(rec), summary, rec, hazards,
                List.of("Keep it switched off, dry and away from heat; do not charge it.",
                        "Do not open the casing or try to remove a damaged battery.",
                        "Back up and erase personal data only if it can be done safely."),
                "Guidance, not certification. AI may be wrong; a trained collector or facility must confirm handling and the final disposal route.");
    }

    private Recommendation recommend(Category cat, ItemCondition cond) {
        if (cond == ItemCondition.WORKING)
            return (cat == Category.PRINTER_PERIPHERAL || cat == Category.SMALL_ELECTRONICS)
                    ? Recommendation.DONATE : Recommendation.RESELL;
        if (cond == ItemCondition.NOT_WORKING
                && (cat == Category.SMALL_ELECTRONICS || cat == Category.LARGE_APPLIANCE))
            return Recommendation.REPAIR;
        return Recommendation.RECYCLE;
    }

    private boolean hasBattery(Category c) {
        return c == Category.PHONE_TABLET || c == Category.LAPTOP_COMPUTER || c == Category.SMALL_ELECTRONICS;
    }

    private List<Hazard> hazardsFor(Category c) {
        Hazard battery = new Hazard("Lithium-ion battery", "Can ignite if punctured, crushed or exposed to heat.");
        return switch (c) {
            case PHONE_TABLET -> List.of(battery);
            case LAPTOP_COMPUTER -> List.of(battery,
                    new Hazard("Lead in older solder", "Internal circuit materials may be hazardous if dismantled."));
            case MONITOR_TV -> List.of(
                    new Hazard("Mercury in older backlights", "Older LCD backlights may contain mercury; broken glass can also injure."));
            case PRINTER_PERIPHERAL -> List.of(
                    new Hazard("Toner and ink residue", "Fine toner dust can irritate lungs and skin; keep cartridges sealed."));
            case LARGE_APPLIANCE -> List.of(
                    new Hazard("Refrigerants and oils", "Fridges and ACs hold gases and oils that trained staff must remove."));
            case SMALL_ELECTRONICS -> List.of(
                    new Hazard("Built-in batteries", "Many small devices hide lithium or button cells; don't open them."));
        };
    }

    private String headline(Recommendation r) {
        return switch (r) {
            case RECYCLE -> "Recover its materials, not its old problems.";
            case REPAIR -> "A little repair could go a long way.";
            case RESELL -> "Still useful. Give it a second life.";
            case DONATE -> "Someone else can still use this.";
        };
    }

    private String label(Category c) {
        return switch (c) {
            case PHONE_TABLET -> "phone or tablet";
            case LAPTOP_COMPUTER -> "laptop or computer";
            case MONITOR_TV -> "monitor or TV";
            case PRINTER_PERIPHERAL -> "printer or peripheral";
            case LARGE_APPLIANCE -> "appliance";
            case SMALL_ELECTRONICS -> "device";
        };
    }

    private String condText(ItemCondition c) {
        return switch (c) { case WORKING -> "in working condition"; case NOT_WORKING -> "not working"; case DAMAGED -> "damaged"; };
    }

    private String route(Recommendation r) {
        return switch (r) {
            case REPAIR -> "a repair check"; case RESELL -> "resale or reuse";
            case DONATE -> "donation"; case RECYCLE -> "responsible recycling";
        };
    }
}