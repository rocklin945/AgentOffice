package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.service.CodeReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/code-reviews")
public class CodeReviewController {

    @Autowired
    private CodeReviewService codeReviewService;

    @GetMapping("/projects/{projectId}/reports")
    public Result<Map<String, Object>> getReports(@PathVariable Long projectId) {
        return Result.success(codeReviewService.getReports(projectId));
    }

    @PostMapping("/projects/{projectId}/review")
    public Result<Map<String, Object>> reviewProjectFiles(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        return Result.success(codeReviewService.reviewProjectFiles(projectId, body));
    }
}
