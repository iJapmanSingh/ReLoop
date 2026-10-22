package com.reloop.backend.advice;

import com.reloop.backend.domain.Recommendation;

import java.util.List;

/** Shape of the safety-advice card in the UI (rule-based, not AI). Stored as JSON on the item. */
public record Advice(String headline, String summary, Recommendation recommendation,
                     List<Hazard> hazards, List<String> tips, String disclaimer) {
    public record Hazard(String title, String detail) {}
}
