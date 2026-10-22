package com.reloop.backend.config;

import com.reloop.backend.domain.*;
import com.reloop.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/** Demo accounts matching the Figma design. Safe to re-run: skips existing emails. */
@Order(1)
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    /** Admin password from ADMIN_PASSWORD. Empty means: use the demo password, but only when demo seeding is on. */
    @Value("${app.admin.password:}")
    private String adminPassword;
    @Value("${app.seed-demo:true}")
    private boolean seedDemo;

    @Override
    public void run(String... args) {
        seedAdmin();
        seed("Ravi Kumar", "ravi@greenloop.in", "Collector@123", Role.COLLECTOR, "+91 90000 01234", "Bengaluru", "560038", "GreenLoop Collection", true, false);
        seed("Ananya Rao", "ananya.rao@example.com", "Citizen@123", Role.CITIZEN, "+91 90000 05678", "Bengaluru", "560038", null, false, false);
        // demo last-mile delivery partner (proposed Amazon partnership) serving the same pincode as the demo citizen
        seed("Suresh Yadav", "suresh@delivery-partner.demo", "Partner@123", Role.COLLECTOR, "+91 90000 07777",
                "Bengaluru", "560038", "Amazon Delivery Partner (proposed pilot)", true, true);
        // demo collector whose application is still waiting for an admin, so the approval screen has something to show
        seed("Meera Nair", "meera@ecocycle.demo", "Collector@123", Role.COLLECTOR, "+91 90000 08888",
                "Bengaluru", "560001", "EcoCycle Recyclers (demo application)", false, false);

        // Demo registration numbers. They are clearly labelled DEMO and are not real registrations.
        demoRegistration("ravi@greenloop.in", "AUTHORISED_COLLECTOR", "DEMO-COL-0001", VerificationStatus.APPROVED,
                "Demo account. This is not a real registration number.");
        demoRegistration("suresh@delivery-partner.demo", "DELIVERY_PARTNER", "DEMO-DLV-0001", VerificationStatus.APPROVED,
                "Demo account. This is not a real registration number.");
        demoRegistration("meera@ecocycle.demo", "RECYCLER", "DEMO-REC-0002", VerificationStatus.PENDING, null);
    }

    /** Fills in the collector application fields once. Also upgrades demo accounts that were created before these fields existed. */
    private void demoRegistration(String email, String type, String regNo, String status, String note) {
        users.findByEmail(email).ifPresent(u -> {
            if (u.getRegistrationNumber() != null) return;
            u.setCollectorType(type);
            u.setRegistrationNumber(regNo);
            u.setVerificationStatus(status);
            u.setVerificationNote(note);
            if (VerificationStatus.APPROVED.equals(status)) u.setVerifiedAt(Instant.now());
            users.save(u);
        });
    }

    /**
     * Creates the admin if missing. When ADMIN_PASSWORD is set, an existing admin's password is rotated to it,
     * so setting the variable on a server that already has the old demo admin fixes it on the next start.
     */
    private void seedAdmin() {
        String pw = !adminPassword.isBlank() ? adminPassword : (seedDemo ? "Admin@123" : "");
        if (pw.isBlank()) return; // no admin until ADMIN_PASSWORD is configured
        User existing = users.findByEmail("admin@ewaste.app").orElse(null);
        if (existing == null) {
            seed("Admin", "admin@ewaste.app", pw, Role.ADMIN, "+91 90000 00000", "Bengaluru", "560001", null, true, false);
        } else if (!adminPassword.isBlank() && !encoder.matches(adminPassword, existing.getPasswordHash())) {
            existing.setPasswordHash(encoder.encode(adminPassword));
            users.save(existing);
        }
    }

    private void seed(String name, String email, String pw, Role role, String phone,
                      String city, String pin, String org, boolean verified, boolean deliveryPartner) {
        if (users.existsByEmail(email)) return;
        User u = new User();
        u.setName(name); u.setEmail(email); u.setPasswordHash(encoder.encode(pw));
        u.setRole(role); u.setPhone(phone); u.setCity(city); u.setPincode(pin);
        u.setOrganization(org); u.setVerified(verified); u.setDeliveryPartner(deliveryPartner);
        users.save(u);
    }
}
