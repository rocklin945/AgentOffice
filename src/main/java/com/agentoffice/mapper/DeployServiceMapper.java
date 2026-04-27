package com.agentoffice.mapper;

import com.agentoffice.entity.DeployService;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface DeployServiceMapper {

    @Select("<script>" +
            "SELECT * FROM deploy_service WHERE 1=1" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY create_time DESC" +
            "</script>")
    List<DeployService> findList(@Param("status") String status);

    @Select("SELECT * FROM deploy_service WHERE id = #{id}")
    DeployService findById(@Param("id") Long id);

    @Select("SELECT * FROM deploy_service ORDER BY create_time DESC")
    List<DeployService> findAll();

    @Insert("INSERT INTO deploy_service (service_name, image, version, status, port) " +
            "VALUES (#{serviceName}, #{image}, #{version}, #{status}, #{port})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DeployService service);

    @Update("UPDATE deploy_service SET service_name = #{serviceName}, image = #{image}, " +
            "version = #{version}, status = #{status}, port = #{port}, update_time = NOW() WHERE id = #{id}")
    int update(DeployService service);

    @Delete("DELETE FROM deploy_service WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Update("UPDATE deploy_service SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Update("UPDATE deploy_service SET container_id = #{containerId}, update_time = NOW() WHERE id = #{id}")
    int updateContainerId(@Param("id") Long id, @Param("containerId") String containerId);

    @Update("UPDATE deploy_service SET cpu_usage = #{cpuUsage}, memory_usage = #{memoryUsage}, " +
            "running_time = #{runningTime}, update_time = NOW() WHERE id = #{id}")
    int updateMetrics(@Param("id") Long id,
                      @Param("cpuUsage") java.math.BigDecimal cpuUsage,
                      @Param("memoryUsage") java.math.BigDecimal memoryUsage,
                      @Param("runningTime") Long runningTime);
}
