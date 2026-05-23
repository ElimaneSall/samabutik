package sn.samabutik.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static sn.samabutik.domain.AppSettingsAsserts.*;
import static sn.samabutik.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import sn.samabutik.domain.AppSettings;
import sn.samabutik.repository.AppSettingsRepository;
import sn.samabutik.service.dto.AppSettingsDTO;
import sn.samabutik.service.mapper.AppSettingsMapper;

/**
 * Integration tests for the {@link AppSettingsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AppSettingsResourceIT {

    private static final String DEFAULT_PARAM_KEY = "AAAAAAAAAA";
    private static final String UPDATED_PARAM_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_PARAM_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_PARAM_VALUE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/app-settings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AppSettingsRepository appSettingsRepository;

    @Autowired
    private AppSettingsMapper appSettingsMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAppSettingsMockMvc;

    private AppSettings appSettings;

    private AppSettings insertedAppSettings;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AppSettings createEntity() {
        return new AppSettings().paramKey(DEFAULT_PARAM_KEY).paramValue(DEFAULT_PARAM_VALUE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AppSettings createUpdatedEntity() {
        return new AppSettings().paramKey(UPDATED_PARAM_KEY).paramValue(UPDATED_PARAM_VALUE);
    }

    @BeforeEach
    void initTest() {
        appSettings = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedAppSettings != null) {
            appSettingsRepository.delete(insertedAppSettings);
            insertedAppSettings = null;
        }
    }

    @Test
    @Transactional
    void createAppSettings() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);
        var returnedAppSettingsDTO = om.readValue(
            restAppSettingsMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(appSettingsDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AppSettingsDTO.class
        );

        // Validate the AppSettings in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAppSettings = appSettingsMapper.toEntity(returnedAppSettingsDTO);
        assertAppSettingsUpdatableFieldsEquals(returnedAppSettings, getPersistedAppSettings(returnedAppSettings));

        insertedAppSettings = returnedAppSettings;
    }

    @Test
    @Transactional
    void createAppSettingsWithExistingId() throws Exception {
        // Create the AppSettings with an existing ID
        appSettings.setId(1L);
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAppSettingsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(appSettingsDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkParamKeyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        appSettings.setParamKey(null);

        // Create the AppSettings, which fails.
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        restAppSettingsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(appSettingsDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAppSettingses() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(appSettings.getId().intValue())))
            .andExpect(jsonPath("$.[*].paramKey").value(hasItem(DEFAULT_PARAM_KEY)))
            .andExpect(jsonPath("$.[*].paramValue").value(hasItem(DEFAULT_PARAM_VALUE)));
    }

    @Test
    @Transactional
    void getAppSettings() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get the appSettings
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL_ID, appSettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(appSettings.getId().intValue()))
            .andExpect(jsonPath("$.paramKey").value(DEFAULT_PARAM_KEY))
            .andExpect(jsonPath("$.paramValue").value(DEFAULT_PARAM_VALUE));
    }

    @Test
    @Transactional
    void getAppSettingsesByIdFiltering() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        Long id = appSettings.getId();

        defaultAppSettingsFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultAppSettingsFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultAppSettingsFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamKeyIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramKey equals to
        defaultAppSettingsFiltering("paramKey.equals=" + DEFAULT_PARAM_KEY, "paramKey.equals=" + UPDATED_PARAM_KEY);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamKeyIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramKey in
        defaultAppSettingsFiltering("paramKey.in=" + DEFAULT_PARAM_KEY + "," + UPDATED_PARAM_KEY, "paramKey.in=" + UPDATED_PARAM_KEY);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamKeyIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramKey is not null
        defaultAppSettingsFiltering("paramKey.specified=true", "paramKey.specified=false");
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamKeyContainsSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramKey contains
        defaultAppSettingsFiltering("paramKey.contains=" + DEFAULT_PARAM_KEY, "paramKey.contains=" + UPDATED_PARAM_KEY);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamKeyNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramKey does not contain
        defaultAppSettingsFiltering("paramKey.doesNotContain=" + UPDATED_PARAM_KEY, "paramKey.doesNotContain=" + DEFAULT_PARAM_KEY);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamValueIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramValue equals to
        defaultAppSettingsFiltering("paramValue.equals=" + DEFAULT_PARAM_VALUE, "paramValue.equals=" + UPDATED_PARAM_VALUE);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamValueIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramValue in
        defaultAppSettingsFiltering(
            "paramValue.in=" + DEFAULT_PARAM_VALUE + "," + UPDATED_PARAM_VALUE,
            "paramValue.in=" + UPDATED_PARAM_VALUE
        );
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamValueIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramValue is not null
        defaultAppSettingsFiltering("paramValue.specified=true", "paramValue.specified=false");
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamValueContainsSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramValue contains
        defaultAppSettingsFiltering("paramValue.contains=" + DEFAULT_PARAM_VALUE, "paramValue.contains=" + UPDATED_PARAM_VALUE);
    }

    @Test
    @Transactional
    void getAllAppSettingsesByParamValueNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        // Get all the appSettingsList where paramValue does not contain
        defaultAppSettingsFiltering("paramValue.doesNotContain=" + UPDATED_PARAM_VALUE, "paramValue.doesNotContain=" + DEFAULT_PARAM_VALUE);
    }

    private void defaultAppSettingsFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultAppSettingsShouldBeFound(shouldBeFound);
        defaultAppSettingsShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAppSettingsShouldBeFound(String filter) throws Exception {
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(appSettings.getId().intValue())))
            .andExpect(jsonPath("$.[*].paramKey").value(hasItem(DEFAULT_PARAM_KEY)))
            .andExpect(jsonPath("$.[*].paramValue").value(hasItem(DEFAULT_PARAM_VALUE)));

        // Check, that the count call also returns 1
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultAppSettingsShouldNotBeFound(String filter) throws Exception {
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restAppSettingsMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingAppSettings() throws Exception {
        // Get the appSettings
        restAppSettingsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAppSettings() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the appSettings
        AppSettings updatedAppSettings = appSettingsRepository.findById(appSettings.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAppSettings are not directly saved in db
        em.detach(updatedAppSettings);
        updatedAppSettings.paramKey(UPDATED_PARAM_KEY).paramValue(UPDATED_PARAM_VALUE);
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(updatedAppSettings);

        restAppSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, appSettingsDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(appSettingsDTO))
            )
            .andExpect(status().isOk());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAppSettingsToMatchAllProperties(updatedAppSettings);
    }

    @Test
    @Transactional
    void putNonExistingAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, appSettingsDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(appSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(appSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(appSettingsDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAppSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the appSettings using partial update
        AppSettings partialUpdatedAppSettings = new AppSettings();
        partialUpdatedAppSettings.setId(appSettings.getId());

        partialUpdatedAppSettings.paramValue(UPDATED_PARAM_VALUE);

        restAppSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAppSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAppSettings))
            )
            .andExpect(status().isOk());

        // Validate the AppSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAppSettingsUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAppSettings, appSettings),
            getPersistedAppSettings(appSettings)
        );
    }

    @Test
    @Transactional
    void fullUpdateAppSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the appSettings using partial update
        AppSettings partialUpdatedAppSettings = new AppSettings();
        partialUpdatedAppSettings.setId(appSettings.getId());

        partialUpdatedAppSettings.paramKey(UPDATED_PARAM_KEY).paramValue(UPDATED_PARAM_VALUE);

        restAppSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAppSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAppSettings))
            )
            .andExpect(status().isOk());

        // Validate the AppSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAppSettingsUpdatableFieldsEquals(partialUpdatedAppSettings, getPersistedAppSettings(partialUpdatedAppSettings));
    }

    @Test
    @Transactional
    void patchNonExistingAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, appSettingsDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(appSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(appSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAppSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        appSettings.setId(longCount.incrementAndGet());

        // Create the AppSettings
        AppSettingsDTO appSettingsDTO = appSettingsMapper.toDto(appSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAppSettingsMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(appSettingsDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AppSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAppSettings() throws Exception {
        // Initialize the database
        insertedAppSettings = appSettingsRepository.saveAndFlush(appSettings);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the appSettings
        restAppSettingsMockMvc
            .perform(delete(ENTITY_API_URL_ID, appSettings.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return appSettingsRepository.count();
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

    protected AppSettings getPersistedAppSettings(AppSettings appSettings) {
        return appSettingsRepository.findById(appSettings.getId()).orElseThrow();
    }

    protected void assertPersistedAppSettingsToMatchAllProperties(AppSettings expectedAppSettings) {
        assertAppSettingsAllPropertiesEquals(expectedAppSettings, getPersistedAppSettings(expectedAppSettings));
    }

    protected void assertPersistedAppSettingsToMatchUpdatableProperties(AppSettings expectedAppSettings) {
        assertAppSettingsAllUpdatablePropertiesEquals(expectedAppSettings, getPersistedAppSettings(expectedAppSettings));
    }
}
