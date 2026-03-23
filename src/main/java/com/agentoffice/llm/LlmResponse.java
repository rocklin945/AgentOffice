package com.agentoffice.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmResponse {
    private String content;
    private List<LlmToolCall> toolCalls;
    private String model;
    private LlmUsage usage;
}
