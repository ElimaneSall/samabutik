package sn.samabutik.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import sn.samabutik.domain.enumeration.UserRole;

/**
 * A DTO for the {@link sn.samabutik.domain.UserStaff} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserStaffDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String email;

    @NotNull
    @Size(max = 15)
    private String phone;

    @NotNull
    @Size(max = 255)
    private String passwordHash;

    @NotNull
    private UserRole role;

    private Boolean isActive;

    private Instant lastLoginAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserStaffDTO)) {
            return false;
        }

        UserStaffDTO userStaffDTO = (UserStaffDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, userStaffDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserStaffDTO{" +
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
