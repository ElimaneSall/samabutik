package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * A Product.
 */
@Entity
@Table(name = "product")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Product implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "sku", length = 50, nullable = false, unique = true)
    private String sku;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "price", precision = 21, scale = 2, nullable = false)
    private BigDecimal price;

    @DecimalMin(value = "0")
    @Column(name = "cost_price", precision = 21, scale = 2)
    private BigDecimal costPrice;

    @Size(max = 3)
    @Column(name = "currency", length = 3)
    private String currency;

    @NotNull
    @Min(value = 0)
    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Min(value = 0)
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Size(max = 50)
    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "is_active")
    private Boolean isActive;

    @JsonIgnoreProperties(value = { "productMain", "packMain", "productGallery", "packGallery" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(unique = true)
    private Media mainMedia;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "product")
    @JsonIgnoreProperties(value = { "performedBy", "product" }, allowSetters = true)
    private Set<StockMovement> stockMovementses = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "productGallery", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "productMain", "packMain", "productGallery", "packGallery" }, allowSetters = true)
    private Set<Media> galleries = new HashSet<>();

    @JsonIgnoreProperties(value = { "productSnapshot", "order" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "productSnapshot")
    private OrderItem orderItem;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Product id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSku() {
        return this.sku;
    }

    public Product sku(String sku) {
        this.setSku(sku);
        return this;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return this.name;
    }

    public Product name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Product description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return this.price;
    }

    public Product price(BigDecimal price) {
        this.setPrice(price);
        return this;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCostPrice() {
        return this.costPrice;
    }

    public Product costPrice(BigDecimal costPrice) {
        this.setCostPrice(costPrice);
        return this;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public String getCurrency() {
        return this.currency;
    }

    public Product currency(String currency) {
        this.setCurrency(currency);
        return this;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Integer getStock() {
        return this.stock;
    }

    public Product stock(Integer stock) {
        this.setStock(stock);
        return this;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Integer getLowStockThreshold() {
        return this.lowStockThreshold;
    }

    public Product lowStockThreshold(Integer lowStockThreshold) {
        this.setLowStockThreshold(lowStockThreshold);
        return this;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public String getCategory() {
        return this.category;
    }

    public Product category(String category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public Product isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Media getMainMedia() {
        return this.mainMedia;
    }

    public void setMainMedia(Media media) {
        this.mainMedia = media;
    }

    public Product mainMedia(Media media) {
        this.setMainMedia(media);
        return this;
    }

    public Set<StockMovement> getStockMovementses() {
        return this.stockMovementses;
    }

    public void setStockMovementses(Set<StockMovement> stockMovements) {
        if (this.stockMovementses != null) {
            this.stockMovementses.forEach(i -> i.setProduct(null));
        }
        if (stockMovements != null) {
            stockMovements.forEach(i -> i.setProduct(this));
        }
        this.stockMovementses = stockMovements;
    }

    public Product stockMovementses(Set<StockMovement> stockMovements) {
        this.setStockMovementses(stockMovements);
        return this;
    }

    public Product addStockMovements(StockMovement stockMovement) {
        this.stockMovementses.add(stockMovement);
        stockMovement.setProduct(this);
        return this;
    }

    public Product removeStockMovements(StockMovement stockMovement) {
        this.stockMovementses.remove(stockMovement);
        stockMovement.setProduct(null);
        return this;
    }

    public Set<Media> getGalleries() {
        return this.galleries;
    }

    public void setGalleries(Set<Media> medias) {
        if (this.galleries != null) {
            this.galleries.forEach(i -> i.setProductGallery(null));
        }
        if (medias != null) {
            medias.forEach(i -> i.setProductGallery(this));
        }
        this.galleries = medias;
    }

    public Product galleries(Set<Media> medias) {
        this.setGalleries(medias);
        return this;
    }

    public Product addGallery(Media media) {
        this.galleries.add(media);
        media.setProductGallery(this);
        return this;
    }

    public Product removeGallery(Media media) {
        this.galleries.remove(media);
        media.setProductGallery(null);
        return this;
    }

    public OrderItem getOrderItem() {
        return this.orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        if (this.orderItem != null) {
            this.orderItem.setProductSnapshot(null);
        }
        if (orderItem != null) {
            orderItem.setProductSnapshot(this);
        }
        this.orderItem = orderItem;
    }

    public Product orderItem(OrderItem orderItem) {
        this.setOrderItem(orderItem);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Product)) {
            return false;
        }
        return getId() != null && getId().equals(((Product) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Product{" +
            "id=" + getId() +
            ", sku='" + getSku() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", price=" + getPrice() +
            ", costPrice=" + getCostPrice() +
            ", currency='" + getCurrency() + "'" +
            ", stock=" + getStock() +
            ", lowStockThreshold=" + getLowStockThreshold() +
            ", category='" + getCategory() + "'" +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
