package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import sn.samabutik.domain.enumeration.DiscountType;

/**
 * A Pack.
 */
@Entity
@Table(name = "pack")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Pack implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "discount_value", precision = 21, scale = 2, nullable = false)
    private BigDecimal discountValue;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "display_on_homepage")
    private Boolean displayOnHomepage;

    @JsonIgnoreProperties(value = { "productMain", "packMain", "productGallery", "packGallery" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private Media mainMedia;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "packGallery")
    @JsonIgnoreProperties(value = { "productMain", "packMain", "productGallery", "packGallery" }, allowSetters = true)
    private Set<Media> galleries = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Pack id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Pack name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Pack description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return this.discountType;
    }

    public Pack discountType(DiscountType discountType) {
        this.setDiscountType(discountType);
        return this;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return this.discountValue;
    }

    public Pack discountValue(BigDecimal discountValue) {
        this.setDiscountValue(discountValue);
        return this;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public Instant getStartDate() {
        return this.startDate;
    }

    public Pack startDate(Instant startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return this.endDate;
    }

    public Pack endDate(Instant endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public Pack isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getDisplayOnHomepage() {
        return this.displayOnHomepage;
    }

    public Pack displayOnHomepage(Boolean displayOnHomepage) {
        this.setDisplayOnHomepage(displayOnHomepage);
        return this;
    }

    public void setDisplayOnHomepage(Boolean displayOnHomepage) {
        this.displayOnHomepage = displayOnHomepage;
    }

    public Media getMainMedia() {
        return this.mainMedia;
    }

    public void setMainMedia(Media media) {
        this.mainMedia = media;
    }

    public Pack mainMedia(Media media) {
        this.setMainMedia(media);
        return this;
    }

    public Set<Media> getGalleries() {
        return this.galleries;
    }

    public void setGalleries(Set<Media> medias) {
        if (this.galleries != null) {
            this.galleries.forEach(i -> i.setPackGallery(null));
        }
        if (medias != null) {
            medias.forEach(i -> i.setPackGallery(this));
        }
        this.galleries = medias;
    }

    public Pack galleries(Set<Media> medias) {
        this.setGalleries(medias);
        return this;
    }

    public Pack addGallery(Media media) {
        this.galleries.add(media);
        media.setPackGallery(this);
        return this;
    }

    public Pack removeGallery(Media media) {
        this.galleries.remove(media);
        media.setPackGallery(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Pack)) {
            return false;
        }
        return getId() != null && getId().equals(((Pack) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Pack{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", discountType='" + getDiscountType() + "'" +
            ", discountValue=" + getDiscountValue() +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", isActive='" + getIsActive() + "'" +
            ", displayOnHomepage='" + getDisplayOnHomepage() + "'" +
            "}";
    }
}
