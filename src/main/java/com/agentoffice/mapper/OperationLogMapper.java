package com.agentoffice.mapper;

import com.agentoffice.entity.OperationLog;
import com.agentoffice.service.UserScope;
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
    int insertRaw(OperationLog log);

    default int insert(OperationLog log) {
        if (log != null && log.getUserId() == null) {
            log.setUserId(UserScope.getUserId());
        }
        return insertRaw(log);
    }

    @Select("SELECT * FROM operation_log WHERE (#{userId} IS NULL OR user_id = #{userId}) ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findRecentForUser(@Param("limit") Integer limit, @Param("userId") Long userId);

    default List<OperationLog> findRecent(Integer limit) {
        return findRecentForUser(limit, UserScope.getUserId());
    }

    @Select("SELECT * FROM operation_log WHERE target_type = #{targetType} AND target_id = #{targetId} " +
            "AND (#{userId} IS NULL OR user_id = #{userId}) ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findByTargetForUser(@Param("targetType") String targetType,
                                           @Param("targetId") Long targetId,
                                           @Param("limit") Integer limit,
                                           @Param("userId") Long userId);

    default List<OperationLog> findByTarget(String targetType, Long targetId, Integer limit) {
        return findByTargetForUser(targetType, targetId, limit, UserScope.getUserId());
    }

    @Select("SELECT * FROM operation_log WHERE action = #{action} AND (#{userId} IS NULL OR user_id = #{userId}) ORDER BY create_time DESC, id DESC LIMIT #{limit}")
    List<OperationLog> findByActionForUser(@Param("action") String action, @Param("limit") Integer limit, @Param("userId") Long userId);

    default List<OperationLog> findByAction(String action, Integer limit) {
        return findByActionForUser(action, limit, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM operation_log WHERE (#{userId} IS NULL OR user_id = #{userId})")
    int countTotalForUser(@Param("userId") Long userId);

    default int countTotal() {
        return countTotalForUser(UserScope.getUserId());
    }
}
