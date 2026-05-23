package sn.samabutik.service;

import java.util.Optional;
import sn.samabutik.service.dto.AppSettingsDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.AppSettings}.
 */
public interface AppSettingsService {
    /**
     * Save a appSettings.
     *
     * @param appSettingsDTO the entity to save.
     * @return the persisted entity.
     */
    AppSettingsDTO save(AppSettingsDTO appSettingsDTO);

    /**
     * Updates a appSettings.
     *
     * @param appSettingsDTO the entity to update.
     * @return the persisted entity.
     */
    AppSettingsDTO update(AppSettingsDTO appSettingsDTO);

    /**
     * Partially updates a appSettings.
     *
     * @param appSettingsDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<AppSettingsDTO> partialUpdate(AppSettingsDTO appSettingsDTO);

    /**
     * Get the "id" appSettings.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<AppSettingsDTO> findOne(Long id);

    /**
     * Delete the "id" appSettings.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
