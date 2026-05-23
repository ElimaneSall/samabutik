package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import sn.samabutik.domain.enumeration.MediaFormat;
import sn.samabutik.domain.enumeration.MediaType;

/**
 * A Media.
 */
@Entity
@Table(name = "media")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Media implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 500)
    @Column(name = "url", length = 500, nullable = false)
    private String url;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MediaType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false)
    private MediaFormat format;

    @NotNull
    @Min(value = 0)
    @Column(name = "size_bytes", nullable = false)
    private Integer sizeBytes;

    @Min(value = 0)
    @Column(name = "width")
    private Integer width;

    @Min(value = 0)
    @Column(name = "height")
    private Integer height;

    @Min(value = 0)
    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(name = "is_main")
    private Boolean isMain;

    @Min(value = 0)
    @Column(name = "display_order")
    private Integer displayOrder;

    @Size(max = 255)
    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @JsonIgnoreProperties(value = { "mainMedia", "stockMovementses", "galleries", "orderItem" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "mainMedia")
    private Product productMain;

    @JsonIgnoreProperties(value = { "mainMedia", "galleries" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "mainMedia")
    private Pack packMain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "mainMedia", "stockMovementses", "galleries", "orderItem" }, allowSetters = true)
    private Product productGallery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "mainMedia", "galleries" }, allowSetters = true)
    private Pack packGallery;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Media id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return this.url;
    }

    public Media url(String url) {
        this.setUrl(url);
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public MediaType getType() {
        return this.type;
    }

    public Media type(MediaType type) {
        this.setType(type);
        return this;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public MediaFormat getFormat() {
        return this.format;
    }

    public Media format(MediaFormat format) {
        this.setFormat(format);
        return this;
    }

    public void setFormat(MediaFormat format) {
        this.format = format;
    }

    public Integer getSizeBytes() {
        return this.sizeBytes;
    }

    public Media sizeBytes(Integer sizeBytes) {
        this.setSizeBytes(sizeBytes);
        return this;
    }

    public void setSizeBytes(Integer sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public Integer getWidth() {
        return this.width;
    }

    public Media width(Integer width) {
        this.setWidth(width);
        return this;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return this.height;
    }

    public Media height(Integer height) {
        this.setHeight(height);
        return this;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getDurationSec() {
        return this.durationSec;
    }

    public Media durationSec(Integer durationSec) {
        this.setDurationSec(durationSec);
        return this;
    }

    public void setDurationSec(Integer durationSec) {
        this.durationSec = durationSec;
    }

    public Boolean getIsMain() {
        return this.isMain;
    }

    public Media isMain(Boolean isMain) {
        this.setIsMain(isMain);
        return this;
    }

    public void setIsMain(Boolean isMain) {
        this.isMain = isMain;
    }

    public Integer getDisplayOrder() {
        return this.displayOrder;
    }

    public Media displayOrder(Integer displayOrder) {
        this.setDisplayOrder(displayOrder);
        return this;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getAltText() {
        return this.altText;
    }

    public Media altText(String altText) {
        this.setAltText(altText);
        return this;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public Instant getUploadedAt() {
        return this.uploadedAt;
    }

    public Media uploadedAt(Instant uploadedAt) {
        this.setUploadedAt(uploadedAt);
        return this;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Product getProductMain() {
        return this.productMain;
    }

    public void setProductMain(Product product) {
        if (this.productMain != null) {
            this.productMain.setMainMedia(null);
        }
        if (product != null) {
            product.setMainMedia(this);
        }
        this.productMain = product;
    }

    public Media productMain(Product product) {
        this.setProductMain(product);
        return this;
    }

    public Pack getPackMain() {
        return this.packMain;
    }

    public void setPackMain(Pack pack) {
        if (this.packMain != null) {
            this.packMain.setMainMedia(null);
        }
        if (pack != null) {
            pack.setMainMedia(this);
        }
        this.packMain = pack;
    }

    public Media packMain(Pack pack) {
        this.setPackMain(pack);
        return this;
    }

    public Product getProductGallery() {
        return this.productGallery;
    }

    public void setProductGallery(Product product) {
        this.productGallery = product;
    }

    public Media productGallery(Product product) {
        this.setProductGallery(product);
        return this;
    }

    public Pack getPackGallery() {
        return this.packGallery;
    }

    public void setPackGallery(Pack pack) {
        this.packGallery = pack;
    }

    public Media packGallery(Pack pack) {
        this.setPackGallery(pack);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Media)) {
            return false;
        }
        return getId() != null && getId().equals(((Media) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Media{" +
            "id=" + getId() +
            ", url='" + getUrl() + "'" +
            ", type='" + getType() + "'" +
            ", format='" + getFormat() + "'" +
            ", sizeBytes=" + getSizeBytes() +
            ", width=" + getWidth() +
            ", height=" + getHeight() +
            ", durationSec=" + getDurationSec() +
            ", isMain='" + getIsMain() + "'" +
            ", displayOrder=" + getDisplayOrder() +
            ", altText='" + getAltText() + "'" +
            ", uploadedAt='" + getUploadedAt() + "'" +
            "}";
    }
}
