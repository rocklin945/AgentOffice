package com.simpleshop.repository;

import com.simpleshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByParentIdIsNullOrderBySortAsc();
    
    List<Category> findByParentIdOrderBySortAsc(Long parentId);
    
    @Query("SELECT c FROM Category c WHERE c.parentId IS NULL ORDER BY c.sort ASC")
    List<Category> findRootCategories();
}