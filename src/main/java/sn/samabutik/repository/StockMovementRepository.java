package sn.samabutik.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.StockMovement;

/**
 * Spring Data JPA repository for the StockMovement entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {}
