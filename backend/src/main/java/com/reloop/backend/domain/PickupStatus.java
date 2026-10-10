package com.reloop.backend.domain;

/** REQUESTED -> ACCEPTED -> PICKED_UP -> RECYCLED. Citizen may cancel only while REQUESTED. */
public enum PickupStatus {
    REQUESTED, ACCEPTED, PICKED_UP, RECYCLED, CANCELLED;

    public boolean canMoveTo(PickupStatus next) {
        return switch (this) {
            case REQUESTED -> next == ACCEPTED || next == CANCELLED;
            case ACCEPTED -> next == PICKED_UP;
            case PICKED_UP -> next == RECYCLED;
            default -> false;
        };
    }
}
