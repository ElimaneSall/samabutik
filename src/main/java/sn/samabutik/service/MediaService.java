package sn.samabutik.service;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.samabutik.service.dto.MediaDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.Media}.
 */
public interface MediaService {
    /**
     * Save a media.
     *
     * @param mediaDTO the entity to save.
     * @return the persisted entity.
     */
    MediaDTO save(MediaDTO mediaDTO);

    /**
     * Updates a media.
     *
     * @param mediaDTO the entity to update.
     * @return the persisted entity.
     */
    MediaDTO update(MediaDTO mediaDTO);

    /**
     * Partially updates a media.
     *
     * @param mediaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<MediaDTO> partialUpdate(MediaDTO mediaDTO);

    /**
     * Get all the medias.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<MediaDTO> findAll(Pageable pageable);

    /**
     * Get all the MediaDTO where ProductMain is {@code null}.
     *
     * @return the {@link List} of entities.
     */
    List<MediaDTO> findAllWhereProductMainIsNull();
    /**
     * Get all the MediaDTO where PackMain is {@code null}.
     *
     * @return the {@link List} of entities.
     */
    List<MediaDTO> findAllWherePackMainIsNull();

    /**
     * Get the "id" media.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<MediaDTO> findOne(Long id);

    /**
     * Delete the "id" media.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
