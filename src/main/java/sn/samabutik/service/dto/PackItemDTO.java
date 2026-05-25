package sn.samabutik.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link sn.samabutik.domain.PackItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PackItemDTO implements Serializable {

    private Long id;

    @NotNull
    @Min(value = 1)
    private Integer quantity;

    private PackDTO pack;

    @JsonIgnoreProperties(value = { "packItems", "galleries" }, allowGetters = true)
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

    public PackDTO getPack() {
        return pack;
    }

    public void setPack(PackDTO pack) {
        this.pack = pack;
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
        if (!(o instanceof PackItemDTO)) {
            return false;
        }

        PackItemDTO packItemDTO = (PackItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, packItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PackItemDTO{" +
            "id=" + getId() +
            ", quantity=" + getQuantity() +
            ", pack=" + getPack() +
            ", product=" + getProduct() +
            "}";
    }
}
