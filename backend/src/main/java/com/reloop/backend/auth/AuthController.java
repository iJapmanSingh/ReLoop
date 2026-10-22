package com.reloop.backend.auth;

import com.reloop.backend.config.ApiException;
import com.reloop.backend.config.JwtService;
import com.reloop.backend.domain.Role;
import com.reloop.backend.domain.User;
import com.reloop.backend.domain.VerificationStatus;
import com.reloop.backend.repo.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    private static final Set<String> COLLECTOR_TYPES =
            Set.of("RECYCLER", "REFURBISHER", "AUTHORISED_COLLECTOR", "DELIVERY_PARTNER");

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, message = "must be at least 8 characters") String password,
            @NotBlank String phone,
            @NotBlank String city,
            String pincode,
            @NotNull Role role,
            String organization,
            String collectorType,
            String registrationNumber) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    public record UserDto(Long id, String name, String email, Role role, String phone,
                          String city, String pincode, String organization, boolean verified,
                          boolean deliveryPartner, int creditBalance,
                          String collectorType, String registrationNumber,
                          String verificationStatus, String verificationNote) {
        public static UserDto of(User u) {
            return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getPhone(),
                    u.getCity(), u.getPincode(), u.getOrganization(), u.isVerified(),
                    u.isDeliveryPartner(), u.getCreditBalance(),
                    u.getCollectorType(), u.getRegistrationNumber(),
                    VerificationStatus.of(u), u.getVerificationNote());
        }
    }

    public record AuthResponse(String token, UserDto user) {}

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        if (r.role() == Role.ADMIN)
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts are invite-only");
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email))
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");

        String type = null;
        String registration = null;
        if (r.role() == Role.COLLECTOR) {
            type = r.collectorType() == null ? "" : r.collectorType().trim().toUpperCase();
            registration = r.registrationNumber() == null ? "" : r.registrationNumber().trim();
            if (r.organization() == null || r.organization().isBlank())
                throw new ApiException(HttpStatus.BAD_REQUEST, "Enter the organization you collect for");
            if (!COLLECTOR_TYPES.contains(type))
                throw new ApiException(HttpStatus.BAD_REQUEST, "Choose what kind of collector you are");
            if (registration.length() < 4)
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Enter your registration or partner ID (at least 4 characters). An admin checks it before you can accept pickups");
            if (type.equals("DELIVERY_PARTNER") && (r.pincode() == null || !r.pincode().matches("\\d{6}")))
                throw new ApiException(HttpStatus.BAD_REQUEST, "Delivery partners need the 6-digit pincode of their delivery route");
        }
        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(r.role());
        u.setPhone(r.phone());
        u.setCity(r.city());
        u.setPincode(r.pincode());
        u.setOrganization(r.organization());
        u.setVerified(false); // collectors must be approved by an admin before accepting pickups
        if (r.role() == Role.COLLECTOR) {
            u.setCollectorType(type);
            u.setRegistrationNumber(registration);
            u.setDeliveryPartner(type.equals("DELIVERY_PARTNER"));
            u.setVerificationStatus(VerificationStatus.PENDING);
        }
        users.save(u);
        return new AuthResponse(jwt.generate(u), UserDto.of(u));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));
        return new AuthResponse(jwt.generate(u), UserDto.of(u));
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal User u) { return UserDto.of(u); }
}
