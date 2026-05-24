package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.entity.ModelConfig;
import com.agentoffice.mapper.ModelConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelConfigService {

    private final ModelConfigMapper modelConfigMapper;

    public List<ModelConfig> list(Long userId, Boolean enabledOnly) {
        return Boolean.TRUE.equals(enabledOnly) ? modelConfigMapper.findEnabledByUser(userId) : modelConfigMapper.findAllByUser(userId);
    }

    public ModelConfig getById(Long userId, Long id) {
        ModelConfig config = modelConfigMapper.findByIdForUser(id, userId);
        if (config == null) {
            throw new BusinessException(404, "模型配置不存在");
        }
        return config;
    }

    public ModelConfig getDefault(Long userId) {
        return modelConfigMapper.findDefaultByUser(userId);
    }

    @Transactional
    public ModelConfig create(Long userId, ModelConfig config) {
        config.setUserId(userId);
        validate(config);
        normalize(config);
        modelConfigMapper.insert(config);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            setDefault(userId, config.getId());
        }
        return getById(userId, config.getId());
    }

    @Transactional
    public ModelConfig update(Long userId, Long id, ModelConfig config) {
        getById(userId, id);
        config.setId(id);
        config.setUserId(userId);
        validate(config);
        normalize(config);
        modelConfigMapper.update(config);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            setDefault(userId, id);
        }
        return getById(userId, id);
    }

    @Transactional
    public void setDefault(Long userId, Long id) {
        ModelConfig config = getById(userId, id);
        if (config.getUserId() == null) {
            throw new BusinessException(400, "系统默认配置不能被个人用户修改");
        }
        modelConfigMapper.clearDefaultExceptForUser(id, userId);
        modelConfigMapper.setDefaultForUser(id, userId);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        ModelConfig config = getById(userId, id);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            throw new BusinessException(400, "默认模型不能删除，请先设置其他默认模型");
        }
        modelConfigMapper.deleteByIdForUser(id, userId);
    }

    private void validate(ModelConfig config) {
        if (config.getConfigName() == null || config.getConfigName().isBlank()) {
            throw new BusinessException(400, "配置名称不能为空");
        }
        if (config.getModelName() == null || config.getModelName().isBlank()) {
            throw new BusinessException(400, "模型名称不能为空");
        }
        if (config.getApiKey() == null || config.getApiKey().isBlank()) {
            throw new BusinessException(400, "API Key 不能为空");
        }
    }

    private void normalize(ModelConfig config) {
        if (config.getProvider() == null || config.getProvider().isBlank()) {
            config.setProvider("OpenAI Compatible");
        }
        if (config.getEnabled() == null) {
            config.setEnabled(1);
        }
        if (config.getIsDefault() == null) {
            config.setIsDefault(0);
        }
    }
}
