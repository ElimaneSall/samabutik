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
    // Dans PackRepository.java
    @Query(
        "SELECT DISTINCT p FROM Pack p " +
            "LEFT JOIN FETCH p.mainMedia " +
            "LEFT JOIN FETCH p.galleries " +
            "LEFT JOIN FETCH p.packItems pi " +
            "LEFT JOIN FETCH pi.product " +
            "WHERE p.id = :id"
    )
    Optional<Pack> findByIdWithMediaAndItems(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Pack p " + "LEFT JOIN FETCH p.mainMedia " + "WHERE p.id = :id")
    Optional<Pack> findByIdWithMedia(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Pack p " + "LEFT JOIN FETCH p.packItems pi " + "LEFT JOIN FETCH pi.product " + "WHERE p.id = :id")
    Optional<Pack> findByIdWithItems(@Param("id") Long id);

    @EntityGraph(attributePaths = { "mainMedia", "galleries", "packItems", "packItems.product" })
    Optional<Pack> findById(Long id);
}
