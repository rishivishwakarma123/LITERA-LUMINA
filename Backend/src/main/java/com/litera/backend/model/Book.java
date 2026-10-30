package com.litera.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double price;

    private Double originalPrice;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @Column(nullable = false)
    private String category;

    @Column(length = 1000)
    private String imageUrl;

    private String conditionLevel = "Like New";
    private String conditionDetails = "Good condition";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_books_seller"))
    @JsonIgnore
    private User seller;

    private String sellerName;
    @JsonIgnore
    private String sellerEmail;
    private String city = "Prayagraj";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status = BookStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Book() {
    }

    public Book(String title, String author, String description, Double price, Double originalPrice,
                Integer quantity, String category, String imageUrl, String conditionLevel,
                Long sellerId, String sellerName, String sellerEmail, String city) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice != null ? originalPrice : price * 1.3;
        this.quantity = quantity != null ? quantity : 1;
        this.category = category;
        this.imageUrl = imageUrl;
        this.conditionLevel = conditionLevel != null ? conditionLevel : "Like New";
        if (sellerId != null) {
            this.seller = new User();
            this.seller.setId(sellerId);
        }
        this.sellerName = sellerName;
        this.sellerEmail = sellerEmail;
        this.city = city != null ? city : "Prayagraj";
        this.status = BookStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    @JsonIgnore
    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public Integer getAvailableQuantity() {
        return Math.max(0, quantity - reservedQuantity);
    }

    @JsonIgnore
    public Integer getStockQuantity() {
        return quantity;
    }

    @JsonIgnore
    public void setStockQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getConditionLevel() {
        return conditionLevel;
    }

    public void setConditionLevel(String conditionLevel) {
        this.conditionLevel = conditionLevel;
    }

    public String getConditionDetails() {
        return conditionDetails;
    }

    public void setConditionDetails(String conditionDetails) {
        this.conditionDetails = conditionDetails;
    }

    public Long getSellerId() {
        return seller == null ? null : seller.getId();
    }

    @Transient
    public void setSellerId(Long sellerId) {
        if (sellerId == null) {
            this.seller = null;
        } else {
            User sellerReference = new User();
            sellerReference.setId(sellerId);
            this.seller = sellerReference;
        }
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
