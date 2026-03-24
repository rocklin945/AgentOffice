package com.agentoffice.controller;

import com.agentoffice.agent.AgentDefinition;
import com.agentoffice.common.result.Result;
import com.agentoffice.dto.ChatRequest;
import com.agentoffice.dto.ChatResponse;
import com.agentoffice.dto.DirectChatRequest;
import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import com.agentoffice.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final LlmService llmService;

    @GetMapping("/test-llm")
    public Result<Map<String, Object>> testLlm() {
        LlmRequest request = LlmRequest.builder()
                .model("MiniMax-M2.7")
                .messages(List.of(new LlmMessage("user", "你好，你是什么模型")))
                .temperature(0.7)
                .maxTokens(100)
                .build();

        LlmResponse response = llmService.chatCompletion(request);
        Map<String, Object> data = new HashMap<>(2);
        data.put("response", response.getContent());
        data.put("model", response.getModel());
        return Result.success("LLM 连接成功", data);
    }

    @PostMapping("/chat")
    public Result<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.chat(request);
        return Result.success(response);
    }

    @PostMapping("/chat/direct")
    public Result<ChatResponse> directChat(@Valid @RequestBody DirectChatRequest request) {
        ChatResponse response = chatService.directChat(request);
        return Result.success(response);
    }

    @GetMapping("/agents")
    public Result<List<Map<String, Object>>> getAgents() {
        List<AgentDefinition> agents = chatService.getAgents();
        List<Map<String, Object>> agentList = agents.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>(5);
                    map.put("slug", a.getSlug());
                    map.put("displayName", a.getDisplayName());
                    map.put("role", a.getRole());
                    map.put("color", a.getColor());
                    map.put("roomId", a.getRoomId());
                    return map;
                })
                .toList();

        return Result.success(agentList);
    }
}
