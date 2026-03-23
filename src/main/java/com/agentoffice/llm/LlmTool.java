package com.agentoffice.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmTool {
    private String type = "function";
    private Function function;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Function {
        private String name;
        private String description;
        private Map<String, Parameter> parameters;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Parameter {
        private String type;
        private String description;
    }
}
