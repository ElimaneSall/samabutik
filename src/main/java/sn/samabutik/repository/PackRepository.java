package sn.samabutik.repository;

import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.Pack;

/**
 * Spring Data JPA repository for the Pack entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PackRepository extends JpaRepository<Pack, Long>, JpaSpecificationExecutor<Pack> {
    @Query(
        "SELECT DISTINCT p FROM Pack p " +
            "LEFT JOIN FETCH p.mainMedia " +
            "LEFT JOIN FETCH p.galleries " +
            "LEFT JOIN FETCH p.packItems pi " +
            "LEFT JOIN FETCH pi.product prod " +
            "LEFT JOIN FETCH prod.mainMedia " +
            "WHERE p.id = :id"
    )
    Optional<Pack> findByIdWithMediaAndItems(@Param("id") Long id);
}
