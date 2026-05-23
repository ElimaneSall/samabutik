package sn.samabutik.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.PackItem;

/**
 * Spring Data JPA repository for the PackItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PackItemRepository extends JpaRepository<PackItem, Long> {}
