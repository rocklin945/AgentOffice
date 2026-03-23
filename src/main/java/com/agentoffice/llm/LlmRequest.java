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
public class LlmRequest {
    private String model;
    private List<LlmMessage> messages;
    private double temperature = 0.7;
    private int maxTokens = 2048;
    private List<LlmTool> tools;
    private String apiBase;
    private String apiKey;
}
