package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import sn.samabutik.domain.enumeration.UserRole;

/**
 * A UserStaff.
 */
@Entity
@Table(name = "user_staff")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserStaff implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @NotNull
    @Size(max = 15)
    @Column(name = "phone", length = 15, nullable = false, unique = true)
    private String phone;

    @NotNull
    @Size(max = 255)
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @JsonIgnoreProperties(value = { "performedBy", "product" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "performedBy")
    private StockMovement stockMovement;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UserStaff id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return this.email;
    }

    public UserStaff email(String email) {
        this.setEmail(email);
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return this.phone;
    }

    public UserStaff phone(String phone) {
        this.setPhone(phone);
        return this;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return this.passwordHash;
    }

    public UserStaff passwordHash(String passwordHash) {
        this.setPasswordHash(passwordHash);
        return this;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return this.role;
    }

    public UserStaff role(UserRole role) {
        this.setRole(role);
        return this;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public UserStaff isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getLastLoginAt() {
        return this.lastLoginAt;
    }

    public UserStaff lastLoginAt(Instant lastLoginAt) {
        this.setLastLoginAt(lastLoginAt);
        return this;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public StockMovement getStockMovement() {
        return this.stockMovement;
    }

    public void setStockMovement(StockMovement stockMovement) {
        if (this.stockMovement != null) {
            this.stockMovement.setPerformedBy(null);
        }
        if (stockMovement != null) {
            stockMovement.setPerformedBy(this);
        }
        this.stockMovement = stockMovement;
    }

    public UserStaff stockMovement(StockMovement stockMovement) {
        this.setStockMovement(stockMovement);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserStaff)) {
            return false;
        }
        return getId() != null && getId().equals(((UserStaff) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserStaff{" +
            "id=" + getId() +
            ", email='" + getEmail() + "'" +
            ", phone='" + getPhone() + "'" +
            ", passwordHash='" + getPasswordHash() + "'" +
            ", role='" + getRole() + "'" +
            ", isActive='" + getIsActive() + "'" +
            ", lastLoginAt='" + getLastLoginAt() + "'" +
            "}";
    }
}
