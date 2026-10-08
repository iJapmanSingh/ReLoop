package com.reloop.backend.config;

import com.reloop.backend.domain.*;
import com.reloop.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Demo accounts matching the Figma design. Safe to re-run: skips existing emails. */
@Order(1)
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        seed("Admin", "admin@ewaste.app", "Admin@123", Role.ADMIN, "+91 90000 00000", "Bengaluru", "560001", null, true);
        seed("Ravi Kumar", "ravi@greenloop.in", "Collector@123", Role.COLLECTOR, "+91 90000 01234", "Bengaluru", "560038", "GreenLoop Collection", true);
        seed("Ananya Rao", "ananya.rao@example.com", "Citizen@123", Role.CITIZEN, "+91 90000 05678", "Bengaluru", "560038", null, false);
    }

    private void seed(String name, String email, String pw, Role role, String phone,
                      String city, String pin, String org, boolean verified) {
        if (users.existsByEmail(email)) return;
        User u = new User();
        u.setName(name); u.setEmail(email); u.setPasswordHash(encoder.encode(pw));
        u.setRole(role); u.setPhone(phone); u.setCity(city); u.setPincode(pin);
        u.setOrganization(org); u.setVerified(verified);
        users.save(u);
    }
}
