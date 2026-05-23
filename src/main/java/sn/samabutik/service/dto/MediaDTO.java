package sn.samabutik.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import sn.samabutik.domain.enumeration.MediaFormat;
import sn.samabutik.domain.enumeration.MediaType;

/**
 * A DTO for the {@link sn.samabutik.domain.Media} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MediaDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 500)
    private String url;

    @NotNull
    private MediaType type;

    @NotNull
    private MediaFormat format;

    @NotNull
    @Min(value = 0)
    private Integer sizeBytes;

    @Min(value = 0)
    private Integer width;

    @Min(value = 0)
    private Integer height;

    @Min(value = 0)
    private Integer durationSec;

    private Boolean isMain;

    @Min(value = 0)
    private Integer displayOrder;

    @Size(max = 255)
    private String altText;

    private Instant uploadedAt;

    private ProductDTO productGallery;

    private PackDTO packGallery;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public MediaFormat getFormat() {
        return format;
    }

    public void setFormat(MediaFormat format) {
        this.format = format;
    }

    public Integer getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Integer sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getDurationSec() {
        return durationSec;
    }

    public void setDurationSec(Integer durationSec) {
        this.durationSec = durationSec;
    }

    public Boolean getIsMain() {
        return isMain;
    }

    public void setIsMain(Boolean isMain) {
        this.isMain = isMain;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public ProductDTO getProductGallery() {
        return productGallery;
    }

    public void setProductGallery(ProductDTO productGallery) {
        this.productGallery = productGallery;
    }

    public PackDTO getPackGallery() {
        return packGallery;
    }

    public void setPackGallery(PackDTO packGallery) {
        this.packGallery = packGallery;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MediaDTO)) {
            return false;
        }

        MediaDTO mediaDTO = (MediaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, mediaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MediaDTO{" +
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
            ", productGallery=" + getProductGallery() +
            ", packGallery=" + getPackGallery() +
            "}";
    }
}
