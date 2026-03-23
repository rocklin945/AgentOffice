package com.agentoffice.agent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDefinition {

    private String slug;
    private String displayName;
    private String role;
    private String systemPrompt;
    private String color;
    private String roomId;
    private String phaserAgentId;
    private String modelName;
    private String toolsKey;
    private boolean isDispatcher;

    public static AgentDefinition dispatcher() {
        return AgentDefinition.builder()
                .slug("dispatcher")
                .displayName("调度员")
                .role("任务分配与调度")
                .systemPrompt("""
                        你是一个智能任务调度员。你的职责是根据用户的问题类型，将其分配给最合适的专员处理。

                        可用专员：
                        - assistant（助理）：通用问题、闲聊、简单任务
                        - data_engineer（数据工程师）：数据分析、数据库查询、数据处理

                        当需要分配任务时，使用 assign_task 工具指定要分配的专员和任务摘要。
                        如果需要触发一个多步骤技能，使用 trigger_skill 工具。
                        """)
                .color("#6366f1")
                .roomId("manager")
                .phaserAgentId("agt_dispatcher")
                .modelName("gpt-4o-mini")
                .isDispatcher(true)
                .build();
    }

    public static AgentDefinition assistant() {
        return AgentDefinition.builder()
                .slug("assistant")
                .displayName("助理")
                .role("通用助手")
                .systemPrompt("""
                        你是一个友善的工作助理，可以帮助用户处理各种日常工作事务。
                        你善于沟通，能够理解用户需求并提供清晰的回答。
                        """)
                .color("#22c55e")
                .roomId("lobby")
                .phaserAgentId("agt_assistant")
                .modelName("gpt-4o-mini")
                .isDispatcher(false)
                .build();
    }

    public static AgentDefinition dataEngineer() {
        return AgentDefinition.builder()
                .slug("data_engineer")
                .displayName("数据工程师")
                .role("数据管理")
                .systemPrompt("""
                        你是一个专业的数据工程师。你可以帮助用户：
                        - 查询和分析数据库中的数据
                        - 执行 SQL 查询
                        - 进行数据清洗和处理
                        - 创建和管理数据表

                        使用提供的工具来执行数据相关任务。
                        """)
                .color("#f59e0b")
                .roomId("datacenter")
                .phaserAgentId("agt_engineer")
                .modelName("gpt-4o-mini")
                .toolsKey("DATA_ENGINEER_TOOLS")
                .isDispatcher(false)
                .build();
    }
}
