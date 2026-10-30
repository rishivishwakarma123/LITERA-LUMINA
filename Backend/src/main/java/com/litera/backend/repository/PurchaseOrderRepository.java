package com.litera.backend.repository;

import com.litera.backend.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
}
