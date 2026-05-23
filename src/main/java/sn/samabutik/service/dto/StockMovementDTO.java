package sn.samabutik.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import sn.samabutik.domain.enumeration.StockReason;

/**
 * A DTO for the {@link sn.samabutik.domain.StockMovement} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StockMovementDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer quantity;

    @NotNull
    private StockReason reason;

    @Size(max = 100)
    private String reference;

    private UserStaffDTO performedBy;

    private ProductDTO product;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public StockReason getReason() {
        return reason;
    }

    public void setReason(StockReason reason) {
        this.reason = reason;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public UserStaffDTO getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(UserStaffDTO performedBy) {
        this.performedBy = performedBy;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockMovementDTO)) {
            return false;
        }

        StockMovementDTO stockMovementDTO = (StockMovementDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, stockMovementDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StockMovementDTO{" +
            "id=" + getId() +
            ", quantity=" + getQuantity() +
            ", reason='" + getReason() + "'" +
            ", reference='" + getReference() + "'" +
            ", performedBy=" + getPerformedBy() +
            ", product=" + getProduct() +
            "}";
    }
}
