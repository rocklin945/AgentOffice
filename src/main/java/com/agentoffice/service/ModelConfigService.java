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

    public List<ModelConfig> list(Boolean enabledOnly) {
        return Boolean.TRUE.equals(enabledOnly) ? modelConfigMapper.findEnabled() : modelConfigMapper.findAll();
    }

    public ModelConfig getById(Long id) {
        ModelConfig config = modelConfigMapper.findById(id);
        if (config == null) {
            throw new BusinessException(404, "模型配置不存在");
        }
        return config;
    }

    public ModelConfig getDefault() {
        return modelConfigMapper.findDefault();
    }

    @Transactional
    public ModelConfig create(ModelConfig config) {
        validate(config);
        normalize(config);
        modelConfigMapper.insert(config);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            setDefault(config.getId());
        }
        return getById(config.getId());
    }

    @Transactional
    public ModelConfig update(Long id, ModelConfig config) {
        getById(id);
        config.setId(id);
        validate(config);
        normalize(config);
        modelConfigMapper.update(config);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            setDefault(id);
        }
        return getById(id);
    }

    @Transactional
    public void setDefault(Long id) {
        getById(id);
        modelConfigMapper.clearDefaultExcept(id);
        modelConfigMapper.setDefault(id);
    }

    @Transactional
    public void delete(Long id) {
        ModelConfig config = getById(id);
        if (config.getIsDefault() != null && config.getIsDefault() == 1) {
            throw new BusinessException(400, "默认模型不能删除，请先设置其他默认模型");
        }
        modelConfigMapper.deleteById(id);
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
