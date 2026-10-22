package com.reloop.backend.credits;

import com.reloop.backend.domain.Category;
import com.reloop.backend.domain.Item;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** estimate() does not touch the database, so the repositories can be null here. */
class CreditServiceTest {

    private final CreditService credits = new CreditService(null, null);

    private Item item(Category category, double kg) {
        Item i = new Item();
        i.setCategory(category);
        i.setWeightKg(kg);
        return i;
    }

    @Test
    void phoneEarnsBaseCreditsPlusTenPerKilo() {
        assertEquals(102, credits.estimate(item(Category.PHONE_TABLET, 0.2)));
    }

    @Test
    void laptopEarnsMoreThanPhone() {
        assertEquals(221, credits.estimate(item(Category.LAPTOP_COMPUTER, 2.1)));
    }

    @Test
    void unknownCategoryFallsBackToSmallElectronicsBase() {
        assertEquals(45, credits.estimate(item(null, 0.5)));
    }

    @Test
    void noItemEarnsNothing() {
        assertEquals(0, credits.estimate(null));
    }
}
