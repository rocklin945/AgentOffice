package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.DeployService;
import com.agentoffice.service.DeployServiceInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deploy")
public class DeployController {

    @Autowired
    private DeployServiceInfo deployService;

    @GetMapping("/services")
    public Result<List<DeployService>> getList(@RequestParam(required = false) String status) {
        List<DeployService> list = deployService.getList(status);
        return Result.success(list);
    }

    @GetMapping("/services/{id}")
    public Result<DeployService> getById(@PathVariable Long id) {
        DeployService service = deployService.getById(id);
        return Result.success(service);
    }

    @PostMapping("/services")
    public Result<DeployService> create(@RequestBody DeployService service) {
        DeployService result = deployService.create(service);
        return Result.success(result);
    }

    @PutMapping("/services/{id}")
    public Result<DeployService> update(@PathVariable Long id, @RequestBody DeployService service) {
        DeployService result = deployService.update(id, service);
        return Result.success(result);
    }

    @DeleteMapping("/services/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        deployService.delete(id);
        return Result.success();
    }

    @PostMapping("/services/{id}/start")
    public Result<Void> start(@PathVariable Long id) {
        deployService.start(id);
        return Result.success();
    }

    @PostMapping("/services/{id}/stop")
    public Result<Void> stop(@PathVariable Long id) {
        deployService.stop(id);
        return Result.success();
    }

    @PostMapping("/services/{id}/restart")
    public Result<Void> restart(@PathVariable Long id) {
        deployService.restart(id);
        return Result.success();
    }

    @GetMapping("/services/{id}/logs")
    public Result<String> getLogs(@PathVariable Long id, @RequestParam(defaultValue = "100") Integer lines) {
        String logs = deployService.getLogs(id, lines);
        return Result.success(logs);
    }
}
