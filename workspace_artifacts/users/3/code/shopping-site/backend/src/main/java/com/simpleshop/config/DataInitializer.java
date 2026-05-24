package com.simpleshop.config;

import com.simpleshop.entity.Category;
import com.simpleshop.entity.Product;
import com.simpleshop.repository.CategoryRepository;
import com.simpleshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            initializeCategories();
        }
        if (productRepository.count() == 0) {
            initializeProducts();
        }
    }
    
    private void initializeCategories() {
        Category electronics = new Category();
        electronics.setName("数码电子");
        electronics.setParentId(null);
        electronics.setSort(1);
        electronics.setIcon("icon-laptop");
        electronics = categoryRepository.save(electronics);
        
        Category phone = new Category();
        phone.setName("手机通讯");
        phone.setParentId(electronics.getId());
        phone.setSort(1);
        categoryRepository.save(phone);
        
        Category computer = new Category();
        computer.setName("电脑办公");
        computer.setParentId(electronics.getId());
        computer.setSort(2);
        categoryRepository.save(computer);
        
        Category clothing = new Category();
        clothing.setName("服装鞋包");
        clothing.setParentId(null);
        clothing.setSort(2);
        clothing.setIcon("icon-bag");
        clothing = categoryRepository.save(clothing);
        
        Category men = new Category();
        men.setName("男装");
        men.setParentId(clothing.getId());
        men.setSort(1);
        categoryRepository.save(men);
        
        Category women = new Category();
        women.setName("女装");
        women.setParentId(clothing.getId());
        women.setSort(2);
        categoryRepository.save(women);
        
        Category home = new Category();
        home.setName("家居生活");
        home.setParentId(null);
        home.setSort(3);
        home.setIcon("icon-home");
        home = categoryRepository.save(home);
        
        Category furniture = new Category();
        furniture.setName("家具家装");
        furniture.setParentId(home.getId());
        furniture.setSort(1);
        categoryRepository.save(furniture);
        
        Category kitchen = new Category();
        kitchen.setName("厨房用品");
        kitchen.setParentId(home.getId());
        kitchen.setSort(2);
        categoryRepository.save(kitchen);
    }
    
    private void initializeProducts() {
        List<Product> products = Arrays.asList(
            createProduct("iPhone 15 Pro Max", new BigDecimal("8999.00"), new BigDecimal("9999.00"),
                "/assets/images/iphone.jpg", "苹果旗舰手机，A17 Pro芯片，钛金属设计", 100, new BigDecimal("4.9"), 1L, true, true),
            createProduct("小米14 Ultra", new BigDecimal("5999.00"), new BigDecimal("6499.00"),
                "/assets/images/xiaomi.jpg", "小米旗舰手机，骁龙8 Gen3处理器", 200, new BigDecimal("4.8"), 1L, true, false),
            createProduct("MacBook Pro 14寸", new BigDecimal("14999.00"), new BigDecimal("16999.00"),
                "/assets/images/macbook.jpg", "M3 Pro芯片，18GB内存，512GB固态", 50, new BigDecimal("4.9"), 2L, true, true),
            createProduct("华为MateBook X Pro", new BigDecimal("9999.00"), new BigDecimal("10999.00"),
                "/assets/images/huawei-laptop.jpg", "13代英特尔酷睿i7，2K触控屏", 80, new BigDecimal("4.7"), 2L, false, false),
            createProduct("男士纯棉T恤", new BigDecimal("89.00"), new BigDecimal("129.00"),
                "/assets/images/men-tshirt.jpg", "100%纯棉，舒适透气，多色可选", 500, new BigDecimal("4.5"), 4L, false, true),
            createProduct("女士连衣裙", new BigDecimal("199.00"), new BigDecimal("299.00"),
                "/assets/images/women-dress.jpg", "2024新款，优雅气质，修身显瘦", 300, new BigDecimal("4.6"), 5L, true, true),
            createProduct("真皮双肩包", new BigDecimal("299.00"), new BigDecimal("399.00"),
                "/assets/images/backpack.jpg", "头层牛皮，多功能收纳，适合商务出行", 150, new BigDecimal("4.4"), 4L, false, false),
            createProduct("北欧简约沙发", new BigDecimal("1999.00"), new BigDecimal("2499.00"),
                "/assets/images/sofa.jpg", "布艺沙发，三人位，适合小户型客厅", 30, new BigDecimal("4.8"), 7L, true, true),
            createProduct("智能马桶盖", new BigDecimal("799.00"), new BigDecimal("999.00"),
                "/assets/images/toilet.jpg", "即热式加热，遥控操作，暖风烘干", 100, new BigDecimal("4.7"), 7L, false, false),
            createProduct("不粘炒锅套装", new BigDecimal("169.00"), new BigDecimal("229.00"),
                "/assets/images/pot-set.jpg", "麦饭石不粘锅，炒煎煮炸一锅搞定", 200, new BigDecimal("4.6"), 8L, false, true)
        );
        
        productRepository.saveAll(products);
    }
    
    private Product createProduct(String name, BigDecimal price, BigDecimal originalPrice,
            String image, String description, int stock, BigDecimal rating,
            Long categoryId, boolean isHot, boolean isRecommended) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setImage(image);
        product.setDescription(description);
        product.setStock(stock);
        product.setRating(rating);
        product.setCategoryId(categoryId);
        product.setIsHot(isHot);
        product.setIsRecommended(isRecommended);
        return product;
    }
}