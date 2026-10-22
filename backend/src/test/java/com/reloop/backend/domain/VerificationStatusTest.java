package com.reloop.backend.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class VerificationStatusTest {

    private User collector(boolean verified, String status) {
        User u = new User();
        u.setRole(Role.COLLECTOR);
        u.setVerified(verified);
        u.setVerificationStatus(status);
        return u;
    }

    @Test
    void olderVerifiedCollectorsCountAsApproved() {
        assertEquals(VerificationStatus.APPROVED, VerificationStatus.of(collector(true, null)));
    }

    @Test
    void olderUnverifiedCollectorsCountAsPending() {
        assertEquals(VerificationStatus.PENDING, VerificationStatus.of(collector(false, null)));
    }

    @Test
    void anExplicitStatusWins() {
        assertEquals(VerificationStatus.SUSPENDED, VerificationStatus.of(collector(false, VerificationStatus.SUSPENDED)));
    }

    @Test
    void citizensHaveNoVerificationStatus() {
        User citizen = new User();
        citizen.setRole(Role.CITIZEN);
        assertNull(VerificationStatus.of(citizen));
    }
}
