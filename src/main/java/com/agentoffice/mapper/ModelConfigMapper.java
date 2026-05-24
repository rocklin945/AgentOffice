package com.agentoffice.mapper;

import com.agentoffice.entity.ModelConfig;
import com.agentoffice.service.UserScope;
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

    @Select("SELECT * FROM model_config WHERE user_id IS NULL OR user_id = #{userId} ORDER BY is_default DESC, enabled DESC, update_time DESC, id DESC")
    List<ModelConfig> findAllByUser(@Param("userId") Long userId);

    default List<ModelConfig> findAll() {
        return findAllByUser(UserScope.getUserId());
    }

    @Select("SELECT * FROM model_config WHERE enabled = 1 AND (user_id IS NULL OR user_id = #{userId}) ORDER BY is_default DESC, update_time DESC, id DESC")
    List<ModelConfig> findEnabledByUser(@Param("userId") Long userId);

    default List<ModelConfig> findEnabled() {
        return findEnabledByUser(UserScope.getUserId());
    }

    @Select("SELECT * FROM model_config WHERE id = #{id} AND (user_id IS NULL OR user_id = #{userId})")
    ModelConfig findByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default ModelConfig findById(Long id) {
        return findByIdForUser(id, UserScope.getUserId());
    }

    @Select("SELECT * FROM model_config WHERE enabled = 1 AND is_default = 1 AND (user_id = #{userId} OR user_id IS NULL) ORDER BY CASE WHEN user_id = #{userId} THEN 0 ELSE 1 END, update_time DESC, id DESC LIMIT 1")
    ModelConfig findDefaultByUser(@Param("userId") Long userId);

    default ModelConfig findDefault() {
        return findDefaultByUser(UserScope.getUserId());
    }

    @Insert("INSERT INTO model_config (user_id, config_name, provider, model_name, api_base, api_key, is_default, enabled, remark) " +
            "VALUES (#{userId}, #{configName}, #{provider}, #{modelName}, #{apiBase}, #{apiKey}, #{isDefault}, #{enabled}, #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ModelConfig config);

    @Update("UPDATE model_config SET config_name = #{configName}, provider = #{provider}, model_name = #{modelName}, " +
            "api_base = #{apiBase}, api_key = #{apiKey}, is_default = #{isDefault}, enabled = #{enabled}, " +
            "remark = #{remark}, update_time = NOW() WHERE id = #{id} AND user_id = #{userId}")
    int update(ModelConfig config);

    @Update("UPDATE model_config SET is_default = 0 WHERE id <> #{id} AND user_id = #{userId}")
    int clearDefaultExceptForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int clearDefaultExcept(Long id) {
        return clearDefaultExceptForUser(id, UserScope.getUserId());
    }

    @Update("UPDATE model_config SET is_default = 1, enabled = 1, update_time = NOW() WHERE id = #{id} AND user_id = #{userId}")
    int setDefaultForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int setDefault(Long id) {
        return setDefaultForUser(id, UserScope.getUserId());
    }

    @Delete("DELETE FROM model_config WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int deleteById(Long id) {
        return deleteByIdForUser(id, UserScope.getUserId());
    }
}
