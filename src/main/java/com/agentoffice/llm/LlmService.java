package com.agentoffice.llm;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmService {

    private final LlmConfig llmConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    private static final String OPENAI_API_BASE = "https://api.openai.com/v1";

    public LlmResponse chatCompletion(LlmRequest request) {
        String resolvedModel = request.getModel() != null ? request.getModel() : llmConfig.getModel();
        String apiBase = request.getApiBase() != null ? request.getApiBase() : llmConfig.getApiBase();
        String apiKey = request.getApiKey() != null ? request.getApiKey() : llmConfig.getApiKey();

        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("LLM API key is not configured");
        }
        if (apiBase == null || apiBase.isEmpty()) {
            apiBase = OPENAI_API_BASE;
        }

        log.info("Calling LLM: model={}, apiBase={}", resolvedModel, apiBase);

        Map<String, Object> body = buildRequestBody(resolvedModel, request);

        try {
            String response = webClient.post()
                    .uri(apiBase + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseResponse(response, resolvedModel);
        } catch (WebClientResponseException e) {
            log.error("LLM API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("LLM API call failed: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> buildRequestBody(String model, LlmRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", request.getMessages());
        body.put("temperature", request.getTemperature());
        body.put("max_tokens", request.getMaxTokens());

        if (request.getTools() != null && !request.getTools().isEmpty()) {
            body.put("tools", convertTools(request.getTools()));
            body.put("tool_choice", "auto");
        }

        return body;
    }

    private List<Map<String, Object>> convertTools(List<LlmTool> tools) {
        return tools.stream().map(tool -> {
            Map<String, Object> result = new HashMap<>();
            result.put("type", tool.getType());

            Map<String, Object> func = new HashMap<>();
            func.put("name", tool.getFunction().getName());
            func.put("description", tool.getFunction().getDescription());
            func.put("parameters", convertParameters(tool.getFunction().getParameters()));

            result.put("function", func);
            return result;
        }).toList();
    }

    private Map<String, Object> convertParameters(Map<String, LlmTool.Parameter> parameters) {
        if (parameters == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("type", "object");
            empty.put("properties", new HashMap<>());
            return empty;
        }

        Map<String, Object> properties = new HashMap<>();
        for (Map.Entry<String, LlmTool.Parameter> entry : parameters.entrySet()) {
            Map<String, Object> prop = new HashMap<>();
            prop.put("type", entry.getValue().getType());
            prop.put("description", entry.getValue().getDescription());
            properties.put(entry.getKey(), prop);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "object");
        result.put("properties", properties);
        return result;
    }

    @SuppressWarnings("unchecked")
    private LlmResponse parseResponse(String responseJson, String model) {
        try {
            Map<String, Object> response = objectMapper.readValue(responseJson, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> choice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");

            String content = (String) message.get("content");

            List<Map<String, Object>> toolCallsRaw = (List<Map<String, Object>>) message.get("tool_calls");
            List<LlmToolCall> toolCalls = null;

            if (toolCallsRaw != null) {
                toolCalls = toolCallsRaw.stream().map(tc -> {
                    Map<String, Object> func = (Map<String, Object>) tc.get("function");
                    return LlmToolCall.builder()
                            .id((String) tc.get("id"))
                            .name((String) func.get("name"))
                            .arguments((String) func.get("arguments"))
                            .build();
                }).toList();
            }

            Map<String, Object> usageRaw = (Map<String, Object>) response.get("usage");
            LlmUsage usage = null;
            if (usageRaw != null) {
                usage = LlmUsage.builder()
                        .inputTokens((Integer) usageRaw.get("prompt_tokens"))
                        .outputTokens((Integer) usageRaw.get("completion_tokens"))
                        .totalTokens((Integer) usageRaw.get("total_tokens"))
                        .build();
            }

            return LlmResponse.builder()
                    .content(content != null ? content : "")
                    .toolCalls(toolCalls)
                    .model(model)
                    .usage(usage)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse LLM response: " + e.getMessage(), e);
        }
    }
}
