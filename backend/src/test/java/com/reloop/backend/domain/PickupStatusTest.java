package com.reloop.backend.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Plain unit tests: no Spring, no database. */
class PickupStatusTest {

    @Test
    void happyPathMovesOneStageAtATime() {
        assertTrue(PickupStatus.REQUESTED.canMoveTo(PickupStatus.ACCEPTED));
        assertTrue(PickupStatus.ACCEPTED.canMoveTo(PickupStatus.PICKED_UP));
        assertTrue(PickupStatus.PICKED_UP.canMoveTo(PickupStatus.RECYCLED));
    }

    @Test
    void stagesCannotBeSkipped() {
        assertFalse(PickupStatus.REQUESTED.canMoveTo(PickupStatus.PICKED_UP));
        assertFalse(PickupStatus.REQUESTED.canMoveTo(PickupStatus.RECYCLED));
        assertFalse(PickupStatus.ACCEPTED.canMoveTo(PickupStatus.RECYCLED));
    }

    @Test
    void citizenCanCancelOnlyBeforeAcceptance() {
        assertTrue(PickupStatus.REQUESTED.canMoveTo(PickupStatus.CANCELLED));
        assertFalse(PickupStatus.ACCEPTED.canMoveTo(PickupStatus.CANCELLED));
        assertFalse(PickupStatus.PICKED_UP.canMoveTo(PickupStatus.CANCELLED));
    }

    @Test
    void finishedPickupsCannotMove() {
        assertFalse(PickupStatus.RECYCLED.canMoveTo(PickupStatus.ACCEPTED));
        assertFalse(PickupStatus.CANCELLED.canMoveTo(PickupStatus.REQUESTED));
    }
}
