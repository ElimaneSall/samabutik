package sn.samabutik.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.samabutik.service.dto.PackItemDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.PackItem}.
 */
public interface PackItemService {
    /**
     * Save a packItem.
     *
     * @param packItemDTO the entity to save.
     * @return the persisted entity.
     */
    PackItemDTO save(PackItemDTO packItemDTO);

    /**
     * Updates a packItem.
     *
     * @param packItemDTO the entity to update.
     * @return the persisted entity.
     */
    PackItemDTO update(PackItemDTO packItemDTO);

    /**
     * Partially updates a packItem.
     *
     * @param packItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PackItemDTO> partialUpdate(PackItemDTO packItemDTO);

    /**
     * Get all the packItems.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PackItemDTO> findAll(Pageable pageable);

    /**
     * Get the "id" packItem.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PackItemDTO> findOne(Long id);

    /**
     * Delete the "id" packItem.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
