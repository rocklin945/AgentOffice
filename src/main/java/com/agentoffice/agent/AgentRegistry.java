package com.agentoffice.agent;

import com.agentoffice.llm.LlmTool;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AgentRegistry {

    private Map<String, AgentDefinition> agents = new HashMap<>();

    @PostConstruct
    public void init() {
        register(AgentDefinition.dispatcher());
        register(AgentDefinition.assistant());
        register(AgentDefinition.dataEngineer());
        log.info("Agent registry initialized with {} agents", agents.size());
    }

    public void register(AgentDefinition agent) {
        agents.put(agent.getSlug(), agent);
    }

    public AgentDefinition get(String slug) {
        return agents.get(slug);
    }

    public Map<String, AgentDefinition> getAll() {
        return new HashMap<>(agents);
    }

    public List<AgentDefinition> getAgentList() {
        return new ArrayList<>(agents.values());
    }

    public String buildDispatcherPrompt() {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个智能任务调度员。根据用户的问题，选择最合适的专员处理。\n\n");
        prompt.append("可用专员：\n");

        for (AgentDefinition agent : agents.values()) {
            if (!agent.isDispatcher()) {
                prompt.append(String.format("- %s（%s）：%s\n",
                        agent.getDisplayName(), agent.getSlug(), agent.getRole()));
            }
        }

        prompt.append("\n你的任务是根据用户描述的问题类型，将其分配给最合适的专员。");
        return prompt.toString();
    }

    public List<LlmTool> buildDispatcherTools() {
        List<LlmTool> tools = new ArrayList<>();

        Map<String, LlmTool.Parameter> assignTaskParams = new HashMap<>();
        assignTaskParams.put("agent_slug", new LlmTool.Parameter("string", "要分配的任务的专员 slug（如：assistant, data_engineer）"));
        assignTaskParams.put("task_summary", new LlmTool.Parameter("string", "任务摘要，描述需要该专员完成的工作"));

        tools.add(new LlmTool("function", new LlmTool.Function("assign_task", "将任务分配给指定的专员处理", assignTaskParams)));

        return tools;
    }
}
