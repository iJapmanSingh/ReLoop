package com.reloop.backend.repo;

import com.reloop.backend.domain.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    List<PickupRequest> findByCitizenOrderByCreatedAtDesc(User citizen);
    List<PickupRequest> findByCollectorOrderByCreatedAtDesc(User collector);
    List<PickupRequest> findByStatusAndCityIgnoreCaseOrderByCreatedAtDesc(PickupStatus status, String city);
    Optional<PickupRequest> findFirstByItemOrderByCreatedAtDesc(Item item);

    /** Row lock so two collectors can't accept the same request at once. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PickupRequest p where p.id = :id")
    Optional<PickupRequest> findForUpdate(@Param("id") Long id);
}
