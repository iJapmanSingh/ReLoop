package com.reloop.backend.item;

import com.reloop.backend.domain.User;
import com.reloop.backend.item.ItemDtos.ItemDto;
import com.reloop.backend.item.ItemDtos.ItemRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@PreAuthorize("hasRole('CITIZEN')")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService service;

    // Create a new e-waste item
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDto create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ItemRequest request) {

        return service.create(user, request);
    }

    // Get all items belonging to the logged-in citizen
    @GetMapping("/mine")
    public List<ItemDto> mine(
            @AuthenticationPrincipal User user) {

        return service.mine(user);
    }

    // Get one item by ID
    @GetMapping("/{id}")
    public ItemDto get(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return service.get(user, id);
    }

    // Update an existing item
    @PutMapping("/{id}")
    public ItemDto update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request) {

        return service.update(user, id, request);
    }

    // Generate advice for an item owned by the authenticated citizen
    @PostMapping("/{id}/advice")
    public ItemDto advice(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return service.generateAdvice(user, id);
    }
}
