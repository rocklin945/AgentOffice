package com.agentoffice.service;

import com.agentoffice.agent.AgentDefinition;
import com.agentoffice.agent.AgentDispatcher;
import com.agentoffice.agent.AgentRegistry;
import com.agentoffice.agent.AgentRunner;
import com.agentoffice.dto.ChatRequest;
import com.agentoffice.dto.ChatResponse;
import com.agentoffice.dto.DirectChatRequest;
import com.agentoffice.llm.LlmMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AgentDispatcher agentDispatcher;
    private final AgentRunner agentRunner;
    private final AgentRegistry agentRegistry;

    public ChatResponse chat(ChatRequest request) {
        String traceId = "trc_" + UUID.randomUUID().toString().substring(0, 8);
        String requestId = "req_" + UUID.randomUUID().toString().substring(0, 8);

        try {
            List<LlmMessage> history = convertHistory(request.getHistory());

            AgentDispatcher.DispatchResult result = agentDispatcher.dispatch(
                    request.getMessage(),
                    request.getConversationId(),
                    history
            );

            List<ChatResponse.AgentMessage> messages = result.messages().stream()
                    .map(m -> ChatResponse.AgentMessage.builder()
                            .role(m.role())
                            .agentSlug(m.agentSlug())
                            .agentName(m.agentName())
                            .content(m.content())
                            .messageType(m.role().equals("dispatcher") ? "routing" : "response")
                            .build())
                    .collect(Collectors.toList());

            List<ChatResponse.AgentMovement> movements = result.movements().stream()
                    .map(m -> ChatResponse.AgentMovement.builder()
                            .agentId(m.agentId())
                            .roomId(m.roomId())
                            .build())
                    .collect(Collectors.toList());

            return ChatResponse.builder()
                    .traceId(traceId)
                    .requestId(requestId)
                    .data(ChatResponse.ResponseData.builder()
                            .conversationId(result.conversationId())
                            .messages(messages)
                            .agentMovements(movements)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Chat error", e);
            return ChatResponse.builder()
                    .traceId(traceId)
                    .requestId(requestId)
                    .error(e.getMessage())
                    .build();
        }
    }

    public ChatResponse directChat(DirectChatRequest request) {
        String traceId = "trc_" + UUID.randomUUID().toString().substring(0, 8);
        String requestId = "req_" + UUID.randomUUID().toString().substring(0, 8);

        try {
            AgentDefinition agent = agentRegistry.get(request.getAgentSlug());
            if (agent == null) {
                return ChatResponse.builder()
                        .traceId(traceId)
                        .requestId(requestId)
                        .error("Agent not found: " + request.getAgentSlug())
                        .build();
            }

            List<LlmMessage> history = convertHistory(request.getHistory());

            AgentRunner.AgentResult result = agentRunner.runAgent(
                    agent,
                    request.getMessage(),
                    history
            );

            String conversationId = request.getConversationId() != null ?
                    request.getConversationId() : "conv_" + UUID.randomUUID().toString().substring(0, 8);

            List<ChatResponse.AgentMessage> messages = result.messages().stream()
                    .map(m -> ChatResponse.AgentMessage.builder()
                            .role(m.role())
                            .agentSlug(m.agentSlug())
                            .agentName(m.agentName())
                            .content(m.content())
                            .messageType("response")
                            .movement(ChatResponse.AgentMovement.builder()
                                    .agentId(result.movement().agentId())
                                    .roomId(result.movement().roomId())
                                    .build())
                            .build())
                    .collect(Collectors.toList());

            return ChatResponse.builder()
                    .traceId(traceId)
                    .requestId(requestId)
                    .data(ChatResponse.ResponseData.builder()
                            .conversationId(conversationId)
                            .messages(messages)
                            .agentMovements(List.of(ChatResponse.AgentMovement.builder()
                                    .agentId(result.movement().agentId())
                                    .roomId(result.movement().roomId())
                                    .build()))
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Direct chat error", e);
            return ChatResponse.builder()
                    .traceId(traceId)
                    .requestId(requestId)
                    .error(e.getMessage())
                    .build();
        }
    }

    public List<AgentDefinition> getAgents() {
        return agentRegistry.getAgentList();
    }

    private List<LlmMessage> convertHistory(List<Map<String, String>> history) {
        if (history == null || history.isEmpty()) {
            return new ArrayList<>();
        }
        return history.stream()
                .map(m -> LlmMessage.builder()
                        .role(m.getOrDefault("role", "user"))
                        .content(m.getOrDefault("content", ""))
                        .build())
                .collect(Collectors.toList());
    }
}
