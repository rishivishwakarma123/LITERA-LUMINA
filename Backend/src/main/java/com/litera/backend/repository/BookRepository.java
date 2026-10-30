package com.litera.backend.repository;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByStatus(BookStatus status);

    long countByStatus(BookStatus status);

    List<Book> findBySeller_Id(Long sellerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    java.util.Optional<Book> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT b FROM Book b
            WHERE b.status = :status AND b.quantity > b.reservedQuantity
              AND (:query IS NULL OR
                   LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                   LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR
                   LOWER(b.category) LIKE LOWER(CONCAT('%', :query, '%')))
              AND (:category IS NULL OR LOWER(b.category) = LOWER(:category))
              AND (:minPrice IS NULL OR b.price >= :minPrice)
              AND (:maxPrice IS NULL OR b.price <= :maxPrice)
              AND (:inStock = false OR b.quantity > 0)
            ORDER BY b.createdAt DESC
            """)
    List<Book> searchMarketplace(@Param("status") BookStatus status,
                                 @Param("query") String query,
                                 @Param("category") String category,
                                 @Param("minPrice") Double minPrice,
                                 @Param("maxPrice") Double maxPrice,
                                 @Param("inStock") boolean inStock);
}