package com.agentoffice.mapper;

import com.agentoffice.entity.OperationLog;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OperationLogMapper {

    @Insert("INSERT INTO operation_log (user_id, action, target_type, target_id, detail, ip_address) " +
            "VALUES (#{userId}, #{action}, #{targetType}, #{targetId}, #{detail}, #{ipAddress})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OperationLog log);

    @Select("SELECT * FROM operation_log ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findRecent(@Param("limit") Integer limit);

    @Select("SELECT * FROM operation_log WHERE target_type = #{targetType} AND target_id = #{targetId} " +
            "ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findByTarget(@Param("targetType") String targetType,
                                    @Param("targetId") Long targetId,
                                    @Param("limit") Integer limit);

    @Select("SELECT * FROM operation_log WHERE action = #{action} ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findByAction(@Param("action") String action, @Param("limit") Integer limit);
}
