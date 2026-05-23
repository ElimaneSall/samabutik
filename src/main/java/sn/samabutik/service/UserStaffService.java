package sn.samabutik.service;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.samabutik.service.dto.UserStaffDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.UserStaff}.
 */
public interface UserStaffService {
    /**
     * Save a userStaff.
     *
     * @param userStaffDTO the entity to save.
     * @return the persisted entity.
     */
    UserStaffDTO save(UserStaffDTO userStaffDTO);

    /**
     * Updates a userStaff.
     *
     * @param userStaffDTO the entity to update.
     * @return the persisted entity.
     */
    UserStaffDTO update(UserStaffDTO userStaffDTO);

    /**
     * Partially updates a userStaff.
     *
     * @param userStaffDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<UserStaffDTO> partialUpdate(UserStaffDTO userStaffDTO);

    /**
     * Get all the userStaffs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<UserStaffDTO> findAll(Pageable pageable);

    /**
     * Get all the UserStaffDTO where StockMovement is {@code null}.
     *
     * @return the {@link List} of entities.
     */
    List<UserStaffDTO> findAllWhereStockMovementIsNull();

    /**
     * Get the "id" userStaff.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<UserStaffDTO> findOne(Long id);

    /**
     * Delete the "id" userStaff.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
