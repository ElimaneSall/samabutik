package sn.samabutik.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static sn.samabutik.domain.UserStaffAsserts.*;
import static sn.samabutik.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.IntegrationTest;
import sn.samabutik.domain.UserStaff;
import sn.samabutik.domain.enumeration.UserRole;
import sn.samabutik.repository.UserStaffRepository;
import sn.samabutik.service.dto.UserStaffDTO;
import sn.samabutik.service.mapper.UserStaffMapper;

/**
 * Integration tests for the {@link UserStaffResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class UserStaffResourceIT {

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE = "AAAAAAAAAA";
    private static final String UPDATED_PHONE = "BBBBBBBBBB";

    private static final String DEFAULT_PASSWORD_HASH = "AAAAAAAAAA";
    private static final String UPDATED_PASSWORD_HASH = "BBBBBBBBBB";

    private static final UserRole DEFAULT_ROLE = UserRole.ADMIN;
    private static final UserRole UPDATED_ROLE = UserRole.MANAGER;

    private static final Boolean DEFAULT_IS_ACTIVE = false;
    private static final Boolean UPDATED_IS_ACTIVE = true;

    private static final Instant DEFAULT_LAST_LOGIN_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LAST_LOGIN_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/user-staffs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UserStaffRepository userStaffRepository;

    @Autowired
    private UserStaffMapper userStaffMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserStaffMockMvc;

    private UserStaff userStaff;

    private UserStaff insertedUserStaff;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserStaff createEntity() {
        return new UserStaff()
            .email(DEFAULT_EMAIL)
            .phone(DEFAULT_PHONE)
            .passwordHash(DEFAULT_PASSWORD_HASH)
            .role(DEFAULT_ROLE)
            .isActive(DEFAULT_IS_ACTIVE)
            .lastLoginAt(DEFAULT_LAST_LOGIN_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserStaff createUpdatedEntity() {
        return new UserStaff()
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .passwordHash(UPDATED_PASSWORD_HASH)
            .role(UPDATED_ROLE)
            .isActive(UPDATED_IS_ACTIVE)
            .lastLoginAt(UPDATED_LAST_LOGIN_AT);
    }

    @BeforeEach
    void initTest() {
        userStaff = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUserStaff != null) {
            userStaffRepository.delete(insertedUserStaff);
            insertedUserStaff = null;
        }
    }

    @Test
    @Transactional
    void createUserStaff() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);
        var returnedUserStaffDTO = om.readValue(
            restUserStaffMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UserStaffDTO.class
        );

        // Validate the UserStaff in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedUserStaff = userStaffMapper.toEntity(returnedUserStaffDTO);
        assertUserStaffUpdatableFieldsEquals(returnedUserStaff, getPersistedUserStaff(returnedUserStaff));

        insertedUserStaff = returnedUserStaff;
    }

    @Test
    @Transactional
    void createUserStaffWithExistingId() throws Exception {
        // Create the UserStaff with an existing ID
        userStaff.setId(1L);
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserStaffMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isBadRequest());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEmailIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userStaff.setEmail(null);

        // Create the UserStaff, which fails.
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        restUserStaffMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPhoneIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userStaff.setPhone(null);

        // Create the UserStaff, which fails.
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        restUserStaffMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPasswordHashIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userStaff.setPasswordHash(null);

        // Create the UserStaff, which fails.
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        restUserStaffMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRoleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userStaff.setRole(null);

        // Create the UserStaff, which fails.
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        restUserStaffMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUserStaffs() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        // Get all the userStaffList
        restUserStaffMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userStaff.getId().intValue())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].passwordHash").value(hasItem(DEFAULT_PASSWORD_HASH)))
            .andExpect(jsonPath("$.[*].role").value(hasItem(DEFAULT_ROLE.toString())))
            .andExpect(jsonPath("$.[*].isActive").value(hasItem(DEFAULT_IS_ACTIVE)))
            .andExpect(jsonPath("$.[*].lastLoginAt").value(hasItem(DEFAULT_LAST_LOGIN_AT.toString())));
    }

    @Test
    @Transactional
    void getUserStaff() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        // Get the userStaff
        restUserStaffMockMvc
            .perform(get(ENTITY_API_URL_ID, userStaff.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userStaff.getId().intValue()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE))
            .andExpect(jsonPath("$.passwordHash").value(DEFAULT_PASSWORD_HASH))
            .andExpect(jsonPath("$.role").value(DEFAULT_ROLE.toString()))
            .andExpect(jsonPath("$.isActive").value(DEFAULT_IS_ACTIVE))
            .andExpect(jsonPath("$.lastLoginAt").value(DEFAULT_LAST_LOGIN_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingUserStaff() throws Exception {
        // Get the userStaff
        restUserStaffMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUserStaff() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userStaff
        UserStaff updatedUserStaff = userStaffRepository.findById(userStaff.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUserStaff are not directly saved in db
        em.detach(updatedUserStaff);
        updatedUserStaff
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .passwordHash(UPDATED_PASSWORD_HASH)
            .role(UPDATED_ROLE)
            .isActive(UPDATED_IS_ACTIVE)
            .lastLoginAt(UPDATED_LAST_LOGIN_AT);
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(updatedUserStaff);

        restUserStaffMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userStaffDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userStaffDTO))
            )
            .andExpect(status().isOk());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUserStaffToMatchAllProperties(updatedUserStaff);
    }

    @Test
    @Transactional
    void putNonExistingUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userStaffDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userStaffDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userStaffDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUserStaffWithPatch() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userStaff using partial update
        UserStaff partialUpdatedUserStaff = new UserStaff();
        partialUpdatedUserStaff.setId(userStaff.getId());

        partialUpdatedUserStaff.isActive(UPDATED_IS_ACTIVE).lastLoginAt(UPDATED_LAST_LOGIN_AT);

        restUserStaffMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserStaff.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserStaff))
            )
            .andExpect(status().isOk());

        // Validate the UserStaff in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserStaffUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUserStaff, userStaff),
            getPersistedUserStaff(userStaff)
        );
    }

    @Test
    @Transactional
    void fullUpdateUserStaffWithPatch() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userStaff using partial update
        UserStaff partialUpdatedUserStaff = new UserStaff();
        partialUpdatedUserStaff.setId(userStaff.getId());

        partialUpdatedUserStaff
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .passwordHash(UPDATED_PASSWORD_HASH)
            .role(UPDATED_ROLE)
            .isActive(UPDATED_IS_ACTIVE)
            .lastLoginAt(UPDATED_LAST_LOGIN_AT);

        restUserStaffMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserStaff.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserStaff))
            )
            .andExpect(status().isOk());

        // Validate the UserStaff in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserStaffUpdatableFieldsEquals(partialUpdatedUserStaff, getPersistedUserStaff(partialUpdatedUserStaff));
    }

    @Test
    @Transactional
    void patchNonExistingUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userStaffDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userStaffDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userStaffDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUserStaff() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userStaff.setId(longCount.incrementAndGet());

        // Create the UserStaff
        UserStaffDTO userStaffDTO = userStaffMapper.toDto(userStaff);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserStaffMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(userStaffDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserStaff in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUserStaff() throws Exception {
        // Initialize the database
        insertedUserStaff = userStaffRepository.saveAndFlush(userStaff);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the userStaff
        restUserStaffMockMvc
            .perform(delete(ENTITY_API_URL_ID, userStaff.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return userStaffRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected UserStaff getPersistedUserStaff(UserStaff userStaff) {
        return userStaffRepository.findById(userStaff.getId()).orElseThrow();
    }

    protected void assertPersistedUserStaffToMatchAllProperties(UserStaff expectedUserStaff) {
        assertUserStaffAllPropertiesEquals(expectedUserStaff, getPersistedUserStaff(expectedUserStaff));
    }

    protected void assertPersistedUserStaffToMatchUpdatableProperties(UserStaff expectedUserStaff) {
        assertUserStaffAllUpdatablePropertiesEquals(expectedUserStaff, getPersistedUserStaff(expectedUserStaff));
    }
}
