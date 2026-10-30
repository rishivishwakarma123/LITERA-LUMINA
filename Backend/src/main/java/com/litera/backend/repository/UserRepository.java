package com.litera.backend.repository;

import com.litera.backend.model.Role;
import com.litera.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByNameIgnoreCaseAndRole(String name, Role role);

    boolean existsByEmailIgnoreCase(String email);
}
