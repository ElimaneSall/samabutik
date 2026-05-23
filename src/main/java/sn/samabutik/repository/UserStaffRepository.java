package sn.samabutik.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.UserStaff;

/**
 * Spring Data JPA repository for the UserStaff entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserStaffRepository extends JpaRepository<UserStaff, Long> {}
