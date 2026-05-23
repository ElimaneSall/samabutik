package sn.samabutik.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.repository.UserStaffRepository;
import sn.samabutik.service.UserStaffService;
import sn.samabutik.service.dto.UserStaffDTO;
import sn.samabutik.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link sn.samabutik.domain.UserStaff}.
 */
@RestController
@RequestMapping("/api/user-staffs")
public class UserStaffResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserStaffResource.class);

    private static final String ENTITY_NAME = "userStaff";

    @Value("${jhipster.clientApp.name:samabutik}")
    private String applicationName;

    private final UserStaffService userStaffService;

    private final UserStaffRepository userStaffRepository;

    public UserStaffResource(UserStaffService userStaffService, UserStaffRepository userStaffRepository) {
        this.userStaffService = userStaffService;
        this.userStaffRepository = userStaffRepository;
    }

    /**
     * {@code POST  /user-staffs} : Create a new userStaff.
     *
     * @param userStaffDTO the userStaffDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userStaffDTO, or with status {@code 400 (Bad Request)} if the userStaff has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UserStaffDTO> createUserStaff(@Valid @RequestBody UserStaffDTO userStaffDTO) throws URISyntaxException {
        LOG.debug("REST request to save UserStaff : {}", userStaffDTO);
        if (userStaffDTO.getId() != null) {
            throw new BadRequestAlertException("A new userStaff cannot already have an ID", ENTITY_NAME, "idexists");
        }
        userStaffDTO = userStaffService.save(userStaffDTO);
        return ResponseEntity.created(new URI("/api/user-staffs/" + userStaffDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, userStaffDTO.getId().toString()))
            .body(userStaffDTO);
    }

    /**
     * {@code PUT  /user-staffs/:id} : Updates an existing userStaff.
     *
     * @param id the id of the userStaffDTO to save.
     * @param userStaffDTO the userStaffDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userStaffDTO,
     * or with status {@code 400 (Bad Request)} if the userStaffDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userStaffDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserStaffDTO> updateUserStaff(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UserStaffDTO userStaffDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update UserStaff : {}, {}", id, userStaffDTO);
        if (userStaffDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userStaffDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userStaffRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        userStaffDTO = userStaffService.update(userStaffDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userStaffDTO.getId().toString()))
            .body(userStaffDTO);
    }

    /**
     * {@code PATCH  /user-staffs/:id} : Partial updates given fields of an existing userStaff, field will ignore if it is null
     *
     * @param id the id of the userStaffDTO to save.
     * @param userStaffDTO the userStaffDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userStaffDTO,
     * or with status {@code 400 (Bad Request)} if the userStaffDTO is not valid,
     * or with status {@code 404 (Not Found)} if the userStaffDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the userStaffDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserStaffDTO> partialUpdateUserStaff(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UserStaffDTO userStaffDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UserStaff partially : {}, {}", id, userStaffDTO);
        if (userStaffDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userStaffDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userStaffRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UserStaffDTO> result = userStaffService.partialUpdate(userStaffDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userStaffDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /user-staffs} : get all the User Staffs.
     *
     * @param pageable the pagination information.
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of User Staffs in body.
     */
    @GetMapping("")
    public ResponseEntity<List<UserStaffDTO>> getAllUserStaffs(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "filter", required = false) String filter
    ) {
        if ("stockmovement-is-null".equals(filter)) {
            LOG.debug("REST request to get all UserStaffs where stockMovement is null");
            return new ResponseEntity<>(userStaffService.findAllWhereStockMovementIsNull(), HttpStatus.OK);
        }
        LOG.debug("REST request to get a page of UserStaffs");
        Page<UserStaffDTO> page = userStaffService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /user-staffs/:id} : get the "id" userStaff.
     *
     * @param id the id of the userStaffDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userStaffDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserStaffDTO> getUserStaff(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UserStaff : {}", id);
        Optional<UserStaffDTO> userStaffDTO = userStaffService.findOne(id);
        return ResponseUtil.wrapOrNotFound(userStaffDTO);
    }

    /**
     * {@code DELETE  /user-staffs/:id} : delete the "id" userStaff.
     *
     * @param id the id of the userStaffDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserStaff(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UserStaff : {}", id);
        userStaffService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
