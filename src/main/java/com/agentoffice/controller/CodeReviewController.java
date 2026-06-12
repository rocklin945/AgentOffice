package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.service.CodeReviewService;
import com.agentoffice.service.CurrentUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/code-reviews")
public class CodeReviewController {

    @Autowired
    private CodeReviewService codeReviewService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/projects/{projectId}/reports")
    public Result<Map<String, Object>> getReports(
            @PathVariable Long projectId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(codeReviewService.getReports(currentUserService.requireUserId(token), projectId));
    }

    @PostMapping("/projects/{projectId}/review")
    public Result<Map<String, Object>> reviewProjectFiles(
            @PathVariable Long projectId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, Object> body) {
        return Result.success(codeReviewService.reviewProjectFiles(currentUserService.requireUserId(token), projectId, body));
    }
}
