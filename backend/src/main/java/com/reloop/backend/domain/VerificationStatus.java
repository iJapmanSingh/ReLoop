package com.reloop.backend.domain;

/** Collector verification states. Stored as plain strings on User so older rows (null) keep working. */
public final class VerificationStatus {
    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";
    public static final String SUSPENDED = "SUSPENDED";

    private VerificationStatus() {}

    /** Effective status of a collector. Null (older rows) means APPROVED if verified, otherwise PENDING. Null for non-collectors. */
    public static String of(User u) {
        if (u.getRole() != Role.COLLECTOR) return null;
        String s = u.getVerificationStatus();
        if (s != null && !s.isBlank()) return s;
        return u.isVerified() ? APPROVED : PENDING;
    }
}
