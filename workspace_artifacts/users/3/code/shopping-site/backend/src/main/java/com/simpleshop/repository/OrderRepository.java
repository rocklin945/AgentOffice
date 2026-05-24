package com.simpleshop.repository;

import com.simpleshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNo(String orderNo);
    
    List<Order> findByUserIdOrderByCreateTimeDesc(Long userId);
    
    List<Order> findByUserId(Long userId);
}