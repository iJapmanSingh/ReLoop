package com.reloop.backend.repo;

import com.reloop.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByPickupOrderByChangedAtAsc(PickupRequest pickup);
}
