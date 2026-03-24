package com.agentoffice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private String traceId;
    private String requestId;
    private ResponseData data;
    private String error;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseData {
        private String conversationId;
        private List<AgentMessage> messages;
        private List<AgentMovement> agentMovements;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentMessage {
        private String role;
        private String agentSlug;
        private String agentName;
        private String content;
        private String messageType;
        private AgentMovement movement;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentMovement {
        private String agentId;
        private String roomId;
    }
}
