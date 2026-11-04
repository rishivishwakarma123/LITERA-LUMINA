package com.litera.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_setup_claim")
public class AdminSetupClaim {
    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String accountEmail;

    protected AdminSetupClaim() {
    }

    public AdminSetupClaim(Long id, String accountEmail) {
        this.id = id;
        this.accountEmail = accountEmail;
    }
}
