package com.agentoffice.llm;

import com.agentoffice.entity.ModelConfig;
import com.agentoffice.mapper.ModelConfigMapper;
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
    private final ModelConfigMapper modelConfigMapper;

    private static final String OPENAI_API_BASE = "https://api.openai.com/v1";
    private static final int RESPONSE_PREVIEW_LIMIT = 800;

    public LlmResponse chatCompletion(LlmRequest request) {
        ModelConfig defaultModel = modelConfigMapper.findDefault();
        String resolvedModel = firstNonBlank(request.getModel(), defaultModel == null ? null : defaultModel.getModelName(), llmConfig.getModel());
        String apiBase = firstNonBlank(request.getApiBase(), defaultModel == null ? null : defaultModel.getApiBase(), llmConfig.getApiBase());
        String apiKey = firstNonBlank(request.getApiKey(), defaultModel == null ? null : defaultModel.getApiKey(), llmConfig.getApiKey());

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
                    .header("Accept", "application/json")
                    .header("User-Agent", "AgentOffice/1.0")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("LLM response received: {} chars", response == null ? 0 : response.length());

            return parseResponse(response, resolvedModel);
        } catch (WebClientResponseException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("LLM API error: {} - {}", e.getStatusCode(), preview(responseBody));
            throw new RuntimeException("LLM API call failed: " + extractApiErrorMessage(responseBody), e);
        }
    }

    private Map<String, Object> buildRequestBody(String model, LlmRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", convertMessages(request.getMessages()));
        body.put("temperature", request.getTemperature());
        body.put("max_tokens", request.getMaxTokens());
        
        // 禁用 DeepSeek 的思考模式，避免 reasoning_content 问题
        if (model != null && model.toLowerCase().contains("deepseek")) {
            body.put("thinking", Map.of("type", "disabled"));
        }

        if (request.getTools() != null && !request.getTools().isEmpty()) {
            body.put("tools", convertTools(request.getTools()));
            body.put("tool_choice", "auto");
        }

        return body;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private List<Map<String, Object>> convertMessages(List<LlmMessage> messages) {
        return messages.stream().map(message -> {
            Map<String, Object> item = new HashMap<>();
            item.put("role", message.getRole());
            item.put("content", message.getContent() == null ? "" : message.getContent());
            if (message.getToolCallId() != null && !message.getToolCallId().isBlank()) {
                item.put("tool_call_id", message.getToolCallId());
            }
            if (message.getToolCalls() != null && !message.getToolCalls().isEmpty()) {
                item.put("tool_calls", message.getToolCalls().stream().map(this::convertToolCall).toList());
            }
            return item;
        }).toList();
    }

    private Map<String, Object> convertToolCall(LlmToolCall toolCall) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", toolCall.getId());
        item.put("type", "function");
        item.put("function", Map.of(
                "name", toolCall.getName(),
                "arguments", toolCall.getArguments() == null ? "{}" : toolCall.getArguments()
        ));
        return item;
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
            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("LLM API returned empty response");
            }

            String body = responseJson.trim();
            if (body.startsWith("data:") || body.contains("\ndata:")) {
                return parseStreamingResponse(body, model);
            }

            Map<String, Object> response = objectMapper.readValue(body, Map.class);
            assertNoApiError(response, body);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw malformedResponse("missing choices", body);
            }

            Map<String, Object> choice = choices.get(0);
            Object messageRaw = choice.get("message");
            if (!(messageRaw instanceof Map)) {
                throw malformedResponse("missing message", body);
            }

            Map<String, Object> message = (Map<String, Object>) messageRaw;

            String content = contentAsString(message.get("content"));

            List<Map<String, Object>> toolCallsRaw = (List<Map<String, Object>>) message.get("tool_calls");
            List<LlmToolCall> toolCalls = null;

            if (toolCallsRaw != null) {
                toolCalls = toolCallsRaw.stream().map(tc -> {
                    Map<String, Object> func = (Map<String, Object>) tc.get("function");
                    if (func == null) {
                        return null;
                    }
                    return LlmToolCall.builder()
                            .id((String) tc.get("id"))
                            .name((String) func.get("name"))
                            .arguments(contentAsString(func.get("arguments")))
                            .build();
                }).filter(toolCall -> toolCall != null).toList();
            }

            Map<String, Object> usageRaw = (Map<String, Object>) response.get("usage");
            LlmUsage usage = null;
            if (usageRaw != null) {
                usage = LlmUsage.builder()
                        .inputTokens(intValue(usageRaw.get("prompt_tokens")))
                        .outputTokens(intValue(usageRaw.get("completion_tokens")))
                        .totalTokens(intValue(usageRaw.get("total_tokens")))
                        .build();
            }

            return LlmResponse.builder()
                    .content(content != null ? content : "")
                    .toolCalls(toolCalls)
                    .model(model)
                    .usage(usage)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse LLM response: " + e.getMessage() + ", body=" + preview(responseJson), e);
        }
    }

    @SuppressWarnings("unchecked")
    private LlmResponse parseStreamingResponse(String responseBody, String model) {
        StringBuilder content = new StringBuilder();

        for (String rawLine : responseBody.split("\\R")) {
            String line = rawLine.trim();
            if (!line.startsWith("data:")) {
                continue;
            }

            String payload = line.substring(5).trim();
            if (payload.isBlank() || "[DONE]".equals(payload)) {
                continue;
            }

            try {
                Map<String, Object> event = objectMapper.readValue(payload, Map.class);
                assertNoApiError(event, payload);

                List<Map<String, Object>> choices = (List<Map<String, Object>>) event.get("choices");
                if (choices == null || choices.isEmpty()) {
                    continue;
                }

                Map<String, Object> choice = choices.get(0);
                Object deltaRaw = choice.get("delta");
                if (deltaRaw instanceof Map) {
                    Map<String, Object> delta = (Map<String, Object>) deltaRaw;
                    content.append(contentAsString(delta.get("content")));
                    continue;
                }

                Object messageRaw = choice.get("message");
                if (messageRaw instanceof Map) {
                    Map<String, Object> message = (Map<String, Object>) messageRaw;
                    content.append(contentAsString(message.get("content")));
                }
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to parse streaming LLM response: " + e.getMessage() + ", chunk=" + preview(payload), e);
            }
        }

        return LlmResponse.builder()
                .content(content.toString())
                .model(model)
                .build();
    }

    @SuppressWarnings("unchecked")
    private void assertNoApiError(Map<String, Object> response, String rawBody) {
        Object error = response.get("error");
        if (error == null) {
            return;
        }

        if (error instanceof Map) {
            Map<String, Object> errorMap = (Map<String, Object>) error;
            String message = firstNonBlank(
                    contentAsString(errorMap.get("message")),
                    contentAsString(errorMap.get("code")),
                    contentAsString(errorMap.get("type"))
            );
            throw new RuntimeException("LLM API returned error: " + (message == null ? preview(rawBody) : message));
        }

        throw new RuntimeException("LLM API returned error: " + contentAsString(error));
    }

    private RuntimeException malformedResponse(String reason, String body) {
        return new RuntimeException("LLM API response " + reason + ": " + preview(body));
    }

    @SuppressWarnings("unchecked")
    private String extractApiErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "empty error response";
        }
        try {
            Map<String, Object> response = objectMapper.readValue(responseBody, Map.class);
            Object error = response.get("error");
            if (error instanceof Map) {
                return contentAsString(((Map<String, Object>) error).get("message"));
            }
            if (error != null) {
                return contentAsString(error);
            }
        } catch (JsonProcessingException ignored) {
            // Fall back to the plain response preview below.
        }
        return preview(responseBody);
    }

    @SuppressWarnings("unchecked")
    private String contentAsString(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof String) {
            return (String) value;
        }
        if (value instanceof List) {
            StringBuilder result = new StringBuilder();
            for (Object item : (List<Object>) value) {
                if (item instanceof Map) {
                    Map<String, Object> map = (Map<String, Object>) item;
                    result.append(contentAsString(firstNonBlankObject(map.get("text"), map.get("content"))));
                } else {
                    result.append(contentAsString(item));
                }
            }
            return result.toString();
        }
        return String.valueOf(value);
    }

    private Object firstNonBlankObject(Object... values) {
        for (Object value : values) {
            if (value != null && !contentAsString(value).isBlank()) {
                return value;
            }
        }
        return null;
    }

    private Integer intValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }

    private String preview(String body) {
        if (body == null) {
            return "";
        }
        String normalized = body.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= RESPONSE_PREVIEW_LIMIT) {
            return normalized;
        }
        return normalized.substring(0, RESPONSE_PREVIEW_LIMIT) + "...";
    }
}
