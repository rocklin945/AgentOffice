package com.agentoffice.mapper;

import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.service.UserScope;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AgentEmployeeMapper {

    @Select("<script>" +
            "SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id " +
            "WHERE (e.user_id IS NULL OR e.user_id = #{userId}) " +
            "<if test='status != null'> AND e.status = #{status}</if>" +
            "<if test='role != null'> AND e.role = #{role}</if>" +
            "<if test='keyword != null'> AND (e.name LIKE CONCAT('%', #{keyword}, '%') OR e.position LIKE CONCAT('%', #{keyword}, '%'))</if>" +
            " ORDER BY e.create_time DESC" +
            "</script>")
    List<AgentEmployee> findListByUser(@Param("userId") Long userId,
                                       @Param("status") String status,
                                       @Param("role") String role,
                                       @Param("keyword") String keyword);

    default List<AgentEmployee> findList(String status, String role, String keyword) {
        return findListByUser(UserScope.getUserId(), status, role, keyword);
    }

    @Select("SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id WHERE e.id = #{id} " +
            "AND (e.user_id IS NULL OR e.user_id = #{userId})")
    AgentEmployee findByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default AgentEmployee findById(Long id) {
        return findByIdForUser(id, UserScope.getUserId());
    }

    @Select("SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id " +
            "WHERE (e.user_id IS NULL OR e.user_id = #{userId}) ORDER BY e.create_time DESC")
    List<AgentEmployee> findAllByUser(@Param("userId") Long userId);

    default List<AgentEmployee> findAll() {
        return findAllByUser(UserScope.getUserId());
    }

    @Insert("INSERT INTO agent_employee (user_id, name, avatar, role, position, status, model_config_id) " +
            "VALUES (#{userId}, #{name}, #{avatar}, #{role}, #{position}, #{status}, #{modelConfigId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AgentEmployee employee);

    @Update("UPDATE agent_employee SET name = #{name}, avatar = #{avatar}, role = #{role}, " +
            "position = #{position}, status = #{status}, " +
            "model_config_id = #{modelConfigId}, update_time = NOW() WHERE id = #{id} AND user_id = #{userId}")
    int update(AgentEmployee employee);

    @Delete("DELETE FROM agent_employee WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int deleteById(Long id) {
        return deleteByIdForUser(id, UserScope.getUserId());
    }

    @Update("UPDATE agent_employee SET status = #{status}, update_time = NOW() WHERE id = #{id} AND (user_id IS NULL OR user_id = #{userId})")
    int updateStatusForUser(@Param("id") Long id, @Param("status") String status, @Param("userId") Long userId);

    default int updateStatus(Long id, String status) {
        return updateStatusForUser(id, status, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM agent_employee WHERE status = #{status} AND (user_id IS NULL OR user_id = #{userId})")
    int countByStatusForUser(@Param("status") String status, @Param("userId") Long userId);

    default int countByStatus(String status) {
        return countByStatusForUser(status, UserScope.getUserId());
    }
}
