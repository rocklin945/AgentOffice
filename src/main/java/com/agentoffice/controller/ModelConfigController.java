package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.ModelConfig;
import com.agentoffice.service.CurrentUserService;
import com.agentoffice.service.ModelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/model-configs")
@RequiredArgsConstructor
public class ModelConfigController {

    private final ModelConfigService modelConfigService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public Result<List<ModelConfig>> list(@RequestParam(required = false) Boolean enabledOnly,
                                          @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(modelConfigService.list(currentUserService.requireUserId(token), enabledOnly));
    }

    @GetMapping("/default")
    public Result<ModelConfig> getDefault(@RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(modelConfigService.getDefault(currentUserService.requireUserId(token)));
    }

    @PostMapping
    public Result<ModelConfig> create(@RequestBody ModelConfig config,
                                      @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(modelConfigService.create(currentUserService.requireUserId(token), config));
    }

    @PutMapping("/{id}")
    public Result<ModelConfig> update(@PathVariable Long id, @RequestBody ModelConfig config,
                                      @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(modelConfigService.update(currentUserService.requireUserId(token), id, config));
    }

    @PatchMapping("/{id}/default")
    public Result<Void> setDefault(@PathVariable Long id,
                                   @RequestHeader(value = "Authorization", required = false) String token) {
        modelConfigService.setDefault(currentUserService.requireUserId(token), id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "Authorization", required = false) String token) {
        modelConfigService.delete(currentUserService.requireUserId(token), id);
        return Result.success();
    }
}
