package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.ModelConfig;
import com.agentoffice.service.ModelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/model-configs")
@RequiredArgsConstructor
public class ModelConfigController {

    private final ModelConfigService modelConfigService;

    @GetMapping
    public Result<List<ModelConfig>> list(@RequestParam(required = false) Boolean enabledOnly) {
        return Result.success(modelConfigService.list(enabledOnly));
    }

    @GetMapping("/default")
    public Result<ModelConfig> getDefault() {
        return Result.success(modelConfigService.getDefault());
    }

    @PostMapping
    public Result<ModelConfig> create(@RequestBody ModelConfig config) {
        return Result.success(modelConfigService.create(config));
    }

    @PutMapping("/{id}")
    public Result<ModelConfig> update(@PathVariable Long id, @RequestBody ModelConfig config) {
        return Result.success(modelConfigService.update(id, config));
    }

    @PatchMapping("/{id}/default")
    public Result<Void> setDefault(@PathVariable Long id) {
        modelConfigService.setDefault(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        modelConfigService.delete(id);
        return Result.success();
    }
}
