package com.agentoffice.service;

import com.agentoffice.entity.DeployService;
import com.agentoffice.mapper.DeployServiceMapper;
import com.agentoffice.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class DeployServiceInfo {

    @Autowired
    private DeployServiceMapper serviceMapper;

    public List<DeployService> getList(String status) {
        return serviceMapper.findList(status);
    }

    public DeployService getById(Long id) {
        DeployService service = serviceMapper.findById(id);
        if (service == null) {
            throw new BusinessException(404, "服务不存在");
        }
        return service;
    }

    @Transactional
    public DeployService create(DeployService service) {
        if (service.getStatus() == null) {
            service.setStatus("已停止");
        }
        serviceMapper.insert(service);
        return service;
    }

    @Transactional
    public DeployService update(Long id, DeployService service) {
        DeployService exist = serviceMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "服务不存在");
        }
        service.setId(id);
        serviceMapper.update(service);
        return service;
    }

    @Transactional
    public void delete(Long id) {
        serviceMapper.deleteById(id);
    }

    @Transactional
    public void start(Long id) {
        DeployService service = serviceMapper.findById(id);
        if (service == null) {
            throw new BusinessException(404, "服务不存在");
        }
        if ("运行中".equals(service.getStatus())) {
            throw new BusinessException(400, "服务已在运行中");
        }
        String containerId = "container_" + UUID.randomUUID().toString().substring(0, 8);
        serviceMapper.updateContainerId(id, containerId);
        serviceMapper.updateStatus(id, "运行中");
        serviceMapper.updateMetrics(id, new BigDecimal("10.5"), new BigDecimal("25.0"), 0L);
    }

    @Transactional
    public void stop(Long id) {
        DeployService service = serviceMapper.findById(id);
        if (service == null) {
            throw new BusinessException(404, "服务不存在");
        }
        if ("已停止".equals(service.getStatus())) {
            throw new BusinessException(400, "服务已停止");
        }
        serviceMapper.updateStatus(id, "已停止");
        serviceMapper.updateMetrics(id, BigDecimal.ZERO, BigDecimal.ZERO, 0L);
    }

    @Transactional
    public void restart(Long id) {
        stop(id);
        start(id);
    }

    public String getLogs(Long id, Integer lines) {
        DeployService service = serviceMapper.findById(id);
        if (service == null) {
            throw new BusinessException(404, "服务不存在");
        }

        // 模拟日志
        StringBuilder logs = new StringBuilder();
        logs.append("[INFO] 2024-01-01 10:00:00 Service started\n");
        logs.append("[INFO] 2024-01-01 10:00:01 Listening on port ").append(service.getPort()).append("\n");
        logs.append("[INFO] 2024-01-01 10:00:02 Health check passed\n");

        return logs.toString();
    }
}
