package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import sn.samabutik.domain.enumeration.StockReason;

/**
 * A StockMovement.
 */
@Entity
@Table(name = "stock_movement")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StockMovement implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private StockReason reason;

    @Size(max = 100)
    @Column(name = "reference", length = 100)
    private String reference;

    @JsonIgnoreProperties(value = { "stockMovement" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private UserStaff performedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "mainMedia", "stockMovementses", "galleries", "orderItem" }, allowSetters = true)
    private Product product;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public StockMovement id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return this.quantity;
    }

    public StockMovement quantity(Integer quantity) {
        this.setQuantity(quantity);
        return this;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public StockReason getReason() {
        return this.reason;
    }

    public StockMovement reason(StockReason reason) {
        this.setReason(reason);
        return this;
    }

    public void setReason(StockReason reason) {
        this.reason = reason;
    }

    public String getReference() {
        return this.reference;
    }

    public StockMovement reference(String reference) {
        this.setReference(reference);
        return this;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public UserStaff getPerformedBy() {
        return this.performedBy;
    }

    public void setPerformedBy(UserStaff userStaff) {
        this.performedBy = userStaff;
    }

    public StockMovement performedBy(UserStaff userStaff) {
        this.setPerformedBy(userStaff);
        return this;
    }

    public Product getProduct() {
        return this.product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public StockMovement product(Product product) {
        this.setProduct(product);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockMovement)) {
            return false;
        }
        return getId() != null && getId().equals(((StockMovement) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StockMovement{" +
            "id=" + getId() +
            ", quantity=" + getQuantity() +
            ", reason='" + getReason() + "'" +
            ", reference='" + getReference() + "'" +
            "}";
    }
}
