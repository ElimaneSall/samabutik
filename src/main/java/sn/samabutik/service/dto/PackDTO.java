package sn.samabutik.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import sn.samabutik.domain.enumeration.DiscountType;

/**
 * A DTO for the {@link sn.samabutik.domain.Pack} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PackDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal discountValue;

    @NotNull
    private Instant startDate;

    @NotNull
    private Instant endDate;

    private Boolean isActive;

    private Boolean displayOnHomepage;

    private MediaDTO mainMedia;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getDisplayOnHomepage() {
        return displayOnHomepage;
    }

    public void setDisplayOnHomepage(Boolean displayOnHomepage) {
        this.displayOnHomepage = displayOnHomepage;
    }

    public MediaDTO getMainMedia() {
        return mainMedia;
    }

    public void setMainMedia(MediaDTO mainMedia) {
        this.mainMedia = mainMedia;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PackDTO)) {
            return false;
        }

        PackDTO packDTO = (PackDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, packDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PackDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", discountType='" + getDiscountType() + "'" +
            ", discountValue=" + getDiscountValue() +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", isActive='" + getIsActive() + "'" +
            ", displayOnHomepage='" + getDisplayOnHomepage() + "'" +
            ", mainMedia=" + getMainMedia() +
            "}";
    }
}
