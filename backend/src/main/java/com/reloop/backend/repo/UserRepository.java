package com.reloop.backend.repo;

import com.reloop.backend.domain.Role;
import com.reloop.backend.domain.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Row lock so credit balance changes (earn/redeem) can't race. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findForUpdate(@Param("id") Long id);

    List<User> findByRoleAndDeliveryPartnerTrueAndVerifiedTrueAndPincode(Role role, String pincode);

    List<User> findByRoleOrderByNameAsc(Role role);
}
