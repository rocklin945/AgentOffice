package com.agentoffice.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DirectChatRequest {

    @NotBlank(message = "消息内容不能为空")
    private String message;

    @NotBlank(message = "Agent slug 不能为空")
    private String agentSlug;

    private String conversationId;

    private List<Map<String, String>> history;
}
