package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_prices")
public class ProductPrice extends BaseEntity {

    // Removed @Id private Long id; (Inherited from BaseEntity)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties("prices")
    @JsonBackReference
    private ProductVariant productVariant;

    @Column(name = "currency_code", nullable = false)
    private String currencyCode;

    @Column(nullable = false)
    private BigDecimal amount;

    // --- GETTERS AND SETTERS ---
    // (getId and setId are inherited from BaseEntity)

    public ProductVariant getProductVariant() { return productVariant; }
    public void setProductVariant(ProductVariant productVariant) { this.productVariant = productVariant; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    // For compatibility with existing code that might use getPrice()
    public BigDecimal getPrice() { return amount; }
}