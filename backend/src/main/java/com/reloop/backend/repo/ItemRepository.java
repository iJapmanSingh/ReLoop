package com.reloop.backend.repo;

import com.reloop.backend.domain.Item;
import com.reloop.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByOwnerOrderByCreatedAtDesc(User owner);
}
