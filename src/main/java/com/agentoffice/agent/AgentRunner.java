package com.agentoffice.agent;

import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import com.agentoffice.llm.LlmTool;
import com.agentoffice.tools.ToolExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentRunner {

    private final LlmService llmService;
    private final ToolExecutor toolExecutor;

    private static final int MAX_TOOL_ROUNDS = 4;

    public record AgentResult(String content, List<AgentMessage> messages, AgentMovement movement) {}
    public record AgentMessage(String role, String agentSlug, String agentName, String content) {}
    public record AgentMovement(String agentId, String roomId) {}

    public AgentResult runAgent(AgentDefinition agent, String userMessage, List<LlmMessage> history) {
        log.info("Running agent: {} for message: {}", agent.getSlug(), userMessage);

        List<LlmMessage> messages = buildMessages(agent.getSystemPrompt(), userMessage, history);
        List<AgentMessage> responseMessages = new ArrayList<>();

        List<LlmTool> tools = null;
        if (agent.getToolsKey() != null && !agent.getToolsKey().isEmpty()) {
            tools = toolExecutor.getToolsByKey(agent.getToolsKey());
        }

        LlmRequest request = LlmRequest.builder()
                .model(agent.getModelName())
                .messages(messages)
                .temperature(0.7)
                .maxTokens(2048)
                .tools(tools)
                .build();

        LlmResponse response = llmService.chatCompletion(request);

        int rounds = 0;
        while (response.getToolCalls() != null && !response.getToolCalls().isEmpty() && rounds < MAX_TOOL_ROUNDS) {
            log.info("Tool calls detected: {}, round {}", response.getToolCalls().size(), rounds + 1);

            for (var toolCall : response.getToolCalls()) {
                messages.add(LlmMessage.builder().role("assistant").content("").build());

                String toolResult = toolExecutor.executeTool(
                        agent.getToolsKey(),
                        toolCall.getName(),
                        parseArguments(toolCall.getArguments())
                );

                messages.add(LlmMessage.builder()
                        .role("tool")
                        .content(toolResult)
                        .build());
            }

            request = LlmRequest.builder()
                    .model(agent.getModelName())
                    .messages(messages)
                    .temperature(0.7)
                    .maxTokens(2048)
                    .tools(tools)
                    .build();

            response = llmService.chatCompletion(request);
            rounds++;
        }

        AgentMovement movement = new AgentMovement(agent.getPhaserAgentId(), agent.getRoomId());
        responseMessages.add(new AgentMessage("agent", agent.getSlug(), agent.getDisplayName(), response.getContent()));

        return new AgentResult(response.getContent(), responseMessages, movement);
    }

    private List<LlmMessage> buildMessages(String systemPrompt, String userMessage, List<LlmMessage> history) {
        List<LlmMessage> messages = new ArrayList<>();
        messages.add(LlmMessage.builder().role("system").content(systemPrompt).build());

        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                messages.add(history.get(i));
            }
        }

        messages.add(LlmMessage.builder().role("user").content(userMessage).build());
        return messages;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseArguments(String arguments) {
        if (arguments == null || arguments.isEmpty()) {
            return Map.of();
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(arguments, Map.class);
        } catch (Exception e) {
            log.warn("Failed to parse arguments: {}", arguments);
            return Map.of();
        }
    }
}
