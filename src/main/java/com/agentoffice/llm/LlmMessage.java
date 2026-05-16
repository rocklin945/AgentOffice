package com.agentoffice.llm;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LlmMessage {
    private String role;
    private String content;
    private List<LlmToolCall> toolCalls;
    private String toolCallId;

    public LlmMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
