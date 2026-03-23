package com.agentoffice.chat;

import com.agentoffice.agent.AgentDefinition;
import com.agentoffice.chat.dto.ChatRequest;
import com.agentoffice.chat.dto.ChatResponse;
import com.agentoffice.chat.dto.DirectChatRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.chat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat/direct")
    public ResponseEntity<ChatResponse> directChat(@Valid @RequestBody DirectChatRequest request) {
        ChatResponse response = chatService.directChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/agents")
    public ResponseEntity<Map<String, Object>> getAgents() {
        List<AgentDefinition> agents = chatService.getAgents();
        List<Map<String, Object>> agentList = agents.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("slug", a.getSlug());
                    map.put("displayName", a.getDisplayName());
                    map.put("role", a.getRole());
                    map.put("color", a.getColor());
                    map.put("roomId", a.getRoomId());
                    return map;
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("agents", agentList);
        return ResponseEntity.ok(result);
    }
}
