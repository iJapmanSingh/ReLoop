package com.reloop.backend.advice;

import com.reloop.backend.domain.Recommendation;

import java.util.List;

/** Shape of the AI advice card in the UI. Stored as JSON on the item. */
public record Advice(String headline, String summary, Recommendation recommendation,
                     List<Hazard> hazards, List<String> tips, String disclaimer) {
    public record Hazard(String title, String detail) {}
}
