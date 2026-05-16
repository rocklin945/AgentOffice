package com.agentoffice.mapper;

import com.agentoffice.entity.ModelConfig;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ModelConfigMapper {

    @Select("SELECT * FROM model_config ORDER BY is_default DESC, enabled DESC, update_time DESC, id DESC")
    List<ModelConfig> findAll();

    @Select("SELECT * FROM model_config WHERE enabled = 1 ORDER BY is_default DESC, update_time DESC, id DESC")
    List<ModelConfig> findEnabled();

    @Select("SELECT * FROM model_config WHERE id = #{id}")
    ModelConfig findById(@Param("id") Long id);

    @Select("SELECT * FROM model_config WHERE enabled = 1 AND is_default = 1 ORDER BY update_time DESC, id DESC LIMIT 1")
    ModelConfig findDefault();

    @Insert("INSERT INTO model_config (config_name, provider, model_name, api_base, api_key, is_default, enabled, remark) " +
            "VALUES (#{configName}, #{provider}, #{modelName}, #{apiBase}, #{apiKey}, #{isDefault}, #{enabled}, #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ModelConfig config);

    @Update("UPDATE model_config SET config_name = #{configName}, provider = #{provider}, model_name = #{modelName}, " +
            "api_base = #{apiBase}, api_key = #{apiKey}, is_default = #{isDefault}, enabled = #{enabled}, " +
            "remark = #{remark}, update_time = NOW() WHERE id = #{id}")
    int update(ModelConfig config);

    @Update("UPDATE model_config SET is_default = 0 WHERE id <> #{id}")
    int clearDefaultExcept(@Param("id") Long id);

    @Update("UPDATE model_config SET is_default = 1, enabled = 1, update_time = NOW() WHERE id = #{id}")
    int setDefault(@Param("id") Long id);

    @Delete("DELETE FROM model_config WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
