package com.agentoffice.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CollaborationChatRequest {
    private String message;
    private List<Long> mentionedEmployeeIds;
    private List<Map<String, String>> history;
}
