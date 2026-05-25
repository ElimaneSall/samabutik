package sn.samabutik.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.dto.ProductDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.Pack}.
 */
public interface PackService {
    /**
     * Save a pack.
     *
     * @param packDTO the entity to save.
     * @return the persisted entity.
     */
    PackDTO save(PackDTO packDTO);

    /**
     * Updates a pack.
     *
     * @param packDTO the entity to update.
     * @return the persisted entity.
     */
    PackDTO update(PackDTO packDTO);

    /**
     * Partially updates a pack.
     *
     * @param packDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PackDTO> partialUpdate(PackDTO packDTO);

    /**
     * Get all the packs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PackDTO> findAll(Specification<Pack> spec, Pageable pageable);

    /**
     * Get the "id" pack.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PackDTO> findOne(Long id);

    /**
     * Delete the "id" pack.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
