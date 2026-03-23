package com.agentoffice.tools;

import com.agentoffice.llm.LlmTool;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ToolExecutor {

    private final ObjectMapper objectMapper;

    public static final String DATA_ENGINEER_TOOLS = "DATA_ENGINEER_TOOLS";

    public String executeTool(String toolsKey, String functionName, Map<String, Object> args) {
        log.info("Executing tool: {} with key: {}", functionName, toolsKey);

        try {
            return switch (functionName) {
                case "execute_sql" -> executeSql(args);
                case "list_user_tables" -> listUserTables(args);
                case "query_data" -> queryData(args);
                case "test_db_connection" -> testDbConnection(args);
                default -> String.format("{\"error\": \"Unknown function: %s\"}", functionName);
            };
        } catch (Exception e) {
            log.error("Tool execution failed: {}", functionName, e);
            return String.format("{\"error\": \"%s\"}", e.getMessage());
        }
    }

    public List<LlmTool> getToolsByKey(String toolsKey) {
        if (DATA_ENGINEER_TOOLS.equals(toolsKey)) {
            return getDataEngineerTools();
        }
        return List.of();
    }

    private List<LlmTool> getDataEngineerTools() {
        return List.of(
                createTool("execute_sql", "执行 SQL 查询语句",
                        Map.of("sql", new LlmTool.Parameter("string", "要执行的 SQL 语句"))),
                createTool("list_user_tables", "列出用户的所有数据表", Map.of()),
                createTool("query_data", "查询数据",
                        Map.of(
                                "table", new LlmTool.Parameter("string", "表名"),
                                "limit", new LlmTool.Parameter("integer", "返回记录数限制"))),
                createTool("test_db_connection", "测试数据库连接", Map.of())
        );
    }

    private LlmTool createTool(String name, String description, Map<String, LlmTool.Parameter> params) {
        return new LlmTool("function", new LlmTool.Function(name, description, params));
    }

    private String executeSql(Map<String, Object> args) throws JsonProcessingException {
        String sql = (String) args.get("sql");
        log.info("Executing SQL: {}", sql);
        Map<String, Object> result = Map.of("sql", sql, "message", "SQL 执行功能待实现");
        return objectMapper.writeValueAsString(result);
    }

    private String listUserTables(Map<String, Object> args) {
        return "{\"tables\": [], \"message\": \"列出表功能待实现\"}";
    }

    private String queryData(Map<String, Object> args) {
        String table = (String) args.get("table");
        Integer limit = args.get("limit") != null ? (Integer) args.get("limit") : 10;
        return String.format("{\"table\": \"%s\", \"limit\": %d, \"data\": [], \"message\": \"查询数据功能待实现\"}", table, limit);
    }

    private String testDbConnection(Map<String, Object> args) {
        return "{\"status\": \"ok\", \"message\": \"数据库连接正常\"}";
    }
}
