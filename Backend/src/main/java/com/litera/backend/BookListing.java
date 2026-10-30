package com.litera.backend;

public class BookListing {
    private Long id;
    private String title;
    private String author;
    private String category;
    private String bookCondition;
    private Double originalPrice;
    private Double sellingPrice;
    private String status; // e.g., "PENDING", "APPROVED"
    private Long userId;   // Foreign Key concept linking to User

    public BookListing(Long id, String title, String author, String category, String bookCondition, Double originalPrice, Double sellingPrice, String status, Long userId) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.bookCondition = bookCondition;
        this.originalPrice = originalPrice;
        this.sellingPrice = sellingPrice;
        this.status = status;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    public String getBookCondition() { return bookCondition; }
    public Double getOriginalPrice() { return originalPrice; }
    public Double getSellingPrice() { return sellingPrice; }
    public String getStatus() { return status; }
    public Long getUserId() { return userId; }

    public void setStatus(String status) { this.status = status; }
}