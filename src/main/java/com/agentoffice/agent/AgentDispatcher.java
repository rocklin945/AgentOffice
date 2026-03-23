package com.agentoffice.agent;

import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentDispatcher {

    private final LlmService llmService;
    private final AgentRegistry agentRegistry;
    private final AgentRunner agentRunner;

    public record DispatchResult(
            String conversationId,
            List<AgentRunner.AgentMessage> messages,
            List<AgentRunner.AgentMovement> movements
    ) {}

    public DispatchResult dispatch(String userMessage, String conversationId, List<LlmMessage> history) {
        log.info("Dispatching message: {}", userMessage);

        if (conversationId == null || conversationId.isEmpty()) {
            conversationId = "conv_" + UUID.randomUUID().toString().substring(0, 8);
        }

        List<AgentRunner.AgentMessage> allMessages = new ArrayList<>();
        List<AgentRunner.AgentMovement> movements = new ArrayList<>();

        AgentDefinition dispatcherAgent = agentRegistry.get("dispatcher");

        List<LlmMessage> messages = new ArrayList<>();
        messages.add(LlmMessage.builder().role("system").content(agentRegistry.buildDispatcherPrompt()).build());

        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                messages.add(history.get(i));
            }
        }

        messages.add(LlmMessage.builder().role("user").content(userMessage).build());

        LlmRequest request = LlmRequest.builder()
                .model(dispatcherAgent.getModelName())
                .messages(messages)
                .temperature(0.7)
                .maxTokens(2048)
                .tools(agentRegistry.buildDispatcherTools())
                .build();

        LlmResponse response = llmService.chatCompletion(request);

        if (response.getToolCalls() != null && !response.getToolCalls().isEmpty()) {
            for (var toolCall : response.getToolCalls()) {
                if ("assign_task".equals(toolCall.getName())) {
                    try {
                        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        var argsMap = mapper.readValue(toolCall.getArguments(), java.util.Map.class);
                        String agentSlug = (String) argsMap.get("agent_slug");
                        String taskSummary = (String) argsMap.get("task_summary");

                        log.info("Assigned task to {}: {}", agentSlug, taskSummary);

                        AgentDefinition targetAgent = agentRegistry.get(agentSlug);
                        if (targetAgent != null) {
                            allMessages.add(new AgentRunner.AgentMessage(
                                    "dispatcher", "dispatcher", "调度员",
                                    "收到，我来帮你分配任务给" + targetAgent.getDisplayName() + "处理。"
                            ));
                            movements.add(new AgentRunner.AgentMovement(
                                    dispatcherAgent.getPhaserAgentId(),
                                    dispatcherAgent.getRoomId()
                            ));

                            AgentRunner.AgentResult result = agentRunner.runAgent(targetAgent, taskSummary, history);
                            allMessages.addAll(result.messages());
                            movements.add(result.movement());
                        }
                    } catch (Exception e) {
                        log.error("Failed to parse assign_task arguments", e);
                    }
                }
            }
        } else {
            allMessages.add(new AgentRunner.AgentMessage(
                    "agent", "dispatcher", "调度员",
                    response.getContent()
            ));
            movements.add(new AgentRunner.AgentMovement(
                    dispatcherAgent.getPhaserAgentId(),
                    dispatcherAgent.getRoomId()
            ));
        }

        return new DispatchResult(conversationId, allMessages, movements);
    }
}
