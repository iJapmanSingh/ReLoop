package com.reloop.backend.repo;

import com.reloop.backend.domain.CreditTransaction;
import com.reloop.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByUserOrderByCreatedAtDesc(User user);
}
