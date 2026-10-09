package com.reloop.backend.advice;

import com.reloop.backend.domain.Item;

public interface AdviceService {
    Advice advise(Item item);
}

