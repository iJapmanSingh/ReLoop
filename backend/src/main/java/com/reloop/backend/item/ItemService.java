package com.reloop.backend.item;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reloop.backend.config.ApiException;
import com.reloop.backend.domain.Item;
import com.reloop.backend.domain.User;
import com.reloop.backend.repo.ItemRepository;
import com.reloop.backend.item.ItemDtos.ItemDto;
import com.reloop.backend.item.ItemDtos.ItemRequest;
import com.reloop.backend.advice.Advice;
import com.reloop.backend.advice.AdviceService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.lang.module.ModuleDescriptor.read;
import static java.nio.file.Files.write;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository items;
    private final AdviceService adviceService;
    private final ObjectMapper mapper;

    // Create a new item for the authenticated user
    public ItemDto create(User owner, ItemRequest request) {
        Item item = new Item();

        item.setOwner(owner);
        apply(item, request);

        Item savedItem = items.save(item);

        return toDto(savedItem);
    }

    // Get all items belonging to the authenticated user
    @Transactional(readOnly = true)
    public List<ItemDto> mine(User owner) {
        return items.findByOwnerOrderByCreatedAtDesc(owner)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // Get one item, but only if it belongs to the authenticated user
    @Transactional(readOnly = true)
    public ItemDto get(User owner, Long id) {
        Item item = owned(owner, id);
        return toDto(item);
    }

    // Update an existing item belonging to the authenticated user
    public ItemDto update(User owner, Long id, ItemRequest request) {
        Item item = owned(owner, id);

        apply(item, request);

        // Item details changed, so any previous recommendation is stale.
        item.setRecommendation(null);
        item.setAdviceJson(null);

        Item savedItem = items.save(item);


        return toDto(savedItem);
    }

    // Generate and save rule-based advice for an owned item
    public ItemDto generateAdvice(User owner, Long id) {
        Item item = owned(owner, id);

        Advice advice = adviceService.advise(item);

        item.setRecommendation(advice.recommendation());
        item.setAdviceJson(write(advice));

        Item savedItem = items.save(item);

        return toDto(savedItem);
    }

    // Find an item only if it belongs to the supplied user
    public Item owned(User owner, Long id) {
        return items.findById(id)
                .filter(item ->
                        item.getOwner().getId().equals(owner.getId()))
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Item not found"
                        ));
    }

    // Copy client-provided fields into the entity
    private void apply(Item item, ItemRequest request) {
        item.setCategory(request.category());
        item.setBrand(request.brand().trim());
        item.setModel(request.model().trim());
        item.setItemCondition(request.condition());
        item.setWeightKg(request.weightKg());
        item.setDescription(request.description().trim());
        item.setPhotoUrl(request.photoUrl());
    }

    // Convert the database entity into an API response DTO
    private ItemDto toDto(Item item) {
        return new ItemDto(
                item.getId(),
                item.getCode(),
                item.getCategory(),
                item.getBrand(),
                item.getModel(),
                item.getItemCondition(),
                item.getWeightKg(),
                item.getDescription(),
                item.getPhotoUrl(),
                item.getRecommendation(),
                read(item.getAdviceJson()),
                null, // pickupId: pickup feature will be added later
                null, // pickupCode: pickup feature will be added later
                item.getCreatedAt()
        );
    }
    // Convert the advice object into JSON for database storage
    private String write(Advice advice) {
        try {
            return mapper.writeValueAsString(advice);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Could not serialize item advice", e);
        }
    }
    // Restore the stored JSON into an Advice object
    private Advice read(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return mapper.readValue(json, Advice.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Could not deserialize stored item advice", e);
        }
    }
}

