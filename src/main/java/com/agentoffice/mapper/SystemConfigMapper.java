package com.agentoffice.mapper;

import com.agentoffice.entity.SystemConfig;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface SystemConfigMapper {

    @Select("SELECT * FROM system_config ORDER BY id")
    List<SystemConfig> findAll();

    @Update("UPDATE system_config SET config_value = #{configValue}, update_time = NOW() WHERE config_key = #{configKey}")
    int updateValue(@Param("configKey") String configKey, @Param("configValue") String configValue);
}
