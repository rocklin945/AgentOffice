package com.simpleshop.controller;

import com.simpleshop.entity.CartItem;
import com.simpleshop.entity.Order;
import com.simpleshop.repository.CartItemRepository;
import com.simpleshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        @SuppressWarnings("unchecked")
        Map<String, Object> receiver = (Map<String, Object>) request.get("receiver");
        
        List<CartItem> cartItems = cartItemRepository.findByCartId(userId);
        if (cartItems.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "购物车为空");
            return ResponseEntity.badRequest().body(response);
        }
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            totalPrice = totalPrice.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setTotalPrice(totalPrice);
        order.setStatus(1);
        order.setReceiverName((String) receiver.get("name"));
        order.setReceiverPhone((String) receiver.get("phone"));
        order.setReceiverAddress((String) receiver.get("address"));
        order.setCreateTime(System.currentTimeMillis());
        order.setUpdateTime(System.currentTimeMillis());
        
        order = orderRepository.save(order);
        
        cartItemRepository.deleteAllByCartId(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "订单创建成功");
        response.put("data", Map.of(
            "orderId", order.getId(),
            "orderNo", order.getOrderNo(),
            "totalPrice", totalPrice
        ));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreateTimeDesc(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orders);
        response.put("total", orders.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/detail/{orderNo}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(@PathVariable String orderNo) {
        return orderRepository.findByOrderNo(orderNo)
            .map(order -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", order);
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "订单不存在");
                return ResponseEntity.status(404).body(response);
            });
    }
    
    private String generateOrderNo() {
        return "SS" + System.currentTimeMillis() + String.format("%04d", new Random().nextInt(10000));
    }
}