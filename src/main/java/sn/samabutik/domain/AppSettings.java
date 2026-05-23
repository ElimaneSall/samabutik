package sn.samabutik.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A AppSettings.
 */
@Entity
@Table(name = "app_settings")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AppSettings implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "param_key", nullable = false, unique = true)
    private String paramKey;

    @Column(name = "param_value")
    private String paramValue;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AppSettings id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getParamKey() {
        return this.paramKey;
    }

    public AppSettings paramKey(String paramKey) {
        this.setParamKey(paramKey);
        return this;
    }

    public void setParamKey(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamValue() {
        return this.paramValue;
    }

    public AppSettings paramValue(String paramValue) {
        this.setParamValue(paramValue);
        return this;
    }

    public void setParamValue(String paramValue) {
        this.paramValue = paramValue;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AppSettings)) {
            return false;
        }
        return getId() != null && getId().equals(((AppSettings) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AppSettings{" +
            "id=" + getId() +
            ", paramKey='" + getParamKey() + "'" +
            ", paramValue='" + getParamValue() + "'" +
            "}";
    }
}
