package sn.samabutik.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.Product;

/**
 * Spring Data JPA repository for the Product entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.mainMedia LEFT JOIN FETCH p.galleries WHERE p.id = :id")
    Optional<Product> findByIdWithMedia(@Param("id") Long id);
}
