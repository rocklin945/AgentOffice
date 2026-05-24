package com.agentoffice.mapper;

import com.agentoffice.entity.DeployService;
import com.agentoffice.service.UserScope;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface DeployServiceMapper {

    @Select("<script>" +
            "SELECT * FROM deploy_service WHERE (#{userId} IS NULL OR user_id = #{userId})" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY create_time DESC" +
            "</script>")
    List<DeployService> findListForUser(@Param("status") String status, @Param("userId") Long userId);

    default List<DeployService> findList(String status) {
        return findListForUser(status, UserScope.getUserId());
    }

    @Select("SELECT * FROM deploy_service WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    DeployService findByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default DeployService findById(Long id) {
        return findByIdForUser(id, UserScope.getUserId());
    }

    @Select("SELECT * FROM deploy_service WHERE image = #{image} AND (#{userId} IS NULL OR user_id = #{userId}) ORDER BY id DESC LIMIT 1")
    DeployService findByImageForUser(@Param("image") String image, @Param("userId") Long userId);

    default DeployService findByImage(String image) {
        return findByImageForUser(image, UserScope.getUserId());
    }

    @Select("SELECT * FROM deploy_service WHERE (#{userId} IS NULL OR user_id = #{userId}) ORDER BY create_time DESC")
    List<DeployService> findAllForUser(@Param("userId") Long userId);

    default List<DeployService> findAll() {
        return findAllForUser(UserScope.getUserId());
    }

    @Insert("INSERT INTO deploy_service (user_id, service_name, image, version, status, port) " +
            "VALUES (#{userId}, #{serviceName}, #{image}, #{version}, #{status}, #{port})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DeployService service);

    @Update("UPDATE deploy_service SET service_name = #{serviceName}, image = #{image}, " +
            "version = #{version}, status = #{status}, port = #{port}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int update(DeployService service);

    @Delete("DELETE FROM deploy_service WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int deleteByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int deleteById(Long id) {
        return deleteByIdForUser(id, UserScope.getUserId());
    }

    @Update("UPDATE deploy_service SET status = #{status}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int updateStatusForUser(@Param("id") Long id, @Param("status") String status, @Param("userId") Long userId);

    default int updateStatus(Long id, String status) {
        return updateStatusForUser(id, status, UserScope.getUserId());
    }

    @Update("UPDATE deploy_service SET container_id = #{containerId}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int updateContainerIdForUser(@Param("id") Long id, @Param("containerId") String containerId, @Param("userId") Long userId);

    default int updateContainerId(Long id, String containerId) {
        return updateContainerIdForUser(id, containerId, UserScope.getUserId());
    }

    @Update("UPDATE deploy_service SET cpu_usage = #{cpuUsage}, memory_usage = #{memoryUsage}, " +
            "running_time = #{runningTime}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int updateMetricsForUser(@Param("id") Long id,
                             @Param("cpuUsage") java.math.BigDecimal cpuUsage,
                             @Param("memoryUsage") java.math.BigDecimal memoryUsage,
                             @Param("runningTime") Long runningTime,
                             @Param("userId") Long userId);

    default int updateMetrics(Long id, java.math.BigDecimal cpuUsage, java.math.BigDecimal memoryUsage, Long runningTime) {
        return updateMetricsForUser(id, cpuUsage, memoryUsage, runningTime, UserScope.getUserId());
    }
}
