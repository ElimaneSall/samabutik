package sn.samabutik.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link sn.samabutik.domain.AppSettings} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AppSettingsDTO implements Serializable {

    private Long id;

    @NotNull
    private String paramKey;

    private String paramValue;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getParamKey() {
        return paramKey;
    }

    public void setParamKey(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamValue() {
        return paramValue;
    }

    public void setParamValue(String paramValue) {
        this.paramValue = paramValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AppSettingsDTO)) {
            return false;
        }

        AppSettingsDTO appSettingsDTO = (AppSettingsDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, appSettingsDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AppSettingsDTO{" +
            "id=" + getId() +
            ", paramKey='" + getParamKey() + "'" +
            ", paramValue='" + getParamValue() + "'" +
            "}";
    }
}
