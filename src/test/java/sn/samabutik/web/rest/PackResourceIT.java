package sn.samabutik.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static sn.samabutik.domain.PackAsserts.*;
import static sn.samabutik.web.rest.TestUtil.createUpdateProxyForBean;
import static sn.samabutik.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.enumeration.DiscountType;
import sn.samabutik.repository.PackRepository;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.mapper.PackMapper;

/**
 * Integration tests for the {@link PackResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PackResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final DiscountType DEFAULT_DISCOUNT_TYPE = DiscountType.PERCENT;
    private static final DiscountType UPDATED_DISCOUNT_TYPE = DiscountType.FIXED;

    private static final BigDecimal DEFAULT_DISCOUNT_VALUE = new BigDecimal(0);
    private static final BigDecimal UPDATED_DISCOUNT_VALUE = new BigDecimal(1);

    private static final Instant DEFAULT_START_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_END_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_END_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_IS_ACTIVE = false;
    private static final Boolean UPDATED_IS_ACTIVE = true;

    private static final Boolean DEFAULT_DISPLAY_ON_HOMEPAGE = false;
    private static final Boolean UPDATED_DISPLAY_ON_HOMEPAGE = true;

    private static final String ENTITY_API_URL = "/api/packs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PackRepository packRepository;

    @Autowired
    private PackMapper packMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPackMockMvc;

    private Pack pack;

    private Pack insertedPack;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Pack createEntity() {
        return new Pack()
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
            .discountType(DEFAULT_DISCOUNT_TYPE)
            .discountValue(DEFAULT_DISCOUNT_VALUE)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .isActive(DEFAULT_IS_ACTIVE)
            .displayOnHomepage(DEFAULT_DISPLAY_ON_HOMEPAGE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Pack createUpdatedEntity() {
        return new Pack()
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .discountType(UPDATED_DISCOUNT_TYPE)
            .discountValue(UPDATED_DISCOUNT_VALUE)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .isActive(UPDATED_IS_ACTIVE)
            .displayOnHomepage(UPDATED_DISPLAY_ON_HOMEPAGE);
    }

    @BeforeEach
    void initTest() {
        pack = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPack != null) {
            packRepository.delete(insertedPack);
            insertedPack = null;
        }
    }

    @Test
    @Transactional
    void createPack() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);
        var returnedPackDTO = om.readValue(
            restPackMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PackDTO.class
        );

        // Validate the Pack in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPack = packMapper.toEntity(returnedPackDTO);
        assertPackUpdatableFieldsEquals(returnedPack, getPersistedPack(returnedPack));

        insertedPack = returnedPack;
    }

    @Test
    @Transactional
    void createPackWithExistingId() throws Exception {
        // Create the Pack with an existing ID
        pack.setId(1L);
        PackDTO packDTO = packMapper.toDto(pack);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pack.setName(null);

        // Create the Pack, which fails.
        PackDTO packDTO = packMapper.toDto(pack);

        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDiscountTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pack.setDiscountType(null);

        // Create the Pack, which fails.
        PackDTO packDTO = packMapper.toDto(pack);

        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDiscountValueIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pack.setDiscountValue(null);

        // Create the Pack, which fails.
        PackDTO packDTO = packMapper.toDto(pack);

        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pack.setStartDate(null);

        // Create the Pack, which fails.
        PackDTO packDTO = packMapper.toDto(pack);

        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pack.setEndDate(null);

        // Create the Pack, which fails.
        PackDTO packDTO = packMapper.toDto(pack);

        restPackMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPacks() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        // Get all the packList
        restPackMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(pack.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].discountType").value(hasItem(DEFAULT_DISCOUNT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].discountValue").value(hasItem(sameNumber(DEFAULT_DISCOUNT_VALUE))))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].isActive").value(hasItem(DEFAULT_IS_ACTIVE)))
            .andExpect(jsonPath("$.[*].displayOnHomepage").value(hasItem(DEFAULT_DISPLAY_ON_HOMEPAGE)));
    }

    @Test
    @Transactional
    void getPack() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        // Get the pack
        restPackMockMvc
            .perform(get(ENTITY_API_URL_ID, pack.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(pack.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.discountType").value(DEFAULT_DISCOUNT_TYPE.toString()))
            .andExpect(jsonPath("$.discountValue").value(sameNumber(DEFAULT_DISCOUNT_VALUE)))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.isActive").value(DEFAULT_IS_ACTIVE))
            .andExpect(jsonPath("$.displayOnHomepage").value(DEFAULT_DISPLAY_ON_HOMEPAGE));
    }

    @Test
    @Transactional
    void getNonExistingPack() throws Exception {
        // Get the pack
        restPackMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPack() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pack
        Pack updatedPack = packRepository.findById(pack.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPack are not directly saved in db
        em.detach(updatedPack);
        updatedPack
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .discountType(UPDATED_DISCOUNT_TYPE)
            .discountValue(UPDATED_DISCOUNT_VALUE)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .isActive(UPDATED_IS_ACTIVE)
            .displayOnHomepage(UPDATED_DISPLAY_ON_HOMEPAGE);
        PackDTO packDTO = packMapper.toDto(updatedPack);

        restPackMockMvc
            .perform(put(ENTITY_API_URL_ID, packDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isOk());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPackToMatchAllProperties(updatedPack);
    }

    @Test
    @Transactional
    void putNonExistingPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(put(ENTITY_API_URL_ID, packDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(packDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePackWithPatch() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pack using partial update
        Pack partialUpdatedPack = new Pack();
        partialUpdatedPack.setId(pack.getId());

        partialUpdatedPack
            .discountType(UPDATED_DISCOUNT_TYPE)
            .discountValue(UPDATED_DISCOUNT_VALUE)
            .startDate(UPDATED_START_DATE)
            .displayOnHomepage(UPDATED_DISPLAY_ON_HOMEPAGE);

        restPackMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPack.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPack))
            )
            .andExpect(status().isOk());

        // Validate the Pack in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPackUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPack, pack), getPersistedPack(pack));
    }

    @Test
    @Transactional
    void fullUpdatePackWithPatch() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pack using partial update
        Pack partialUpdatedPack = new Pack();
        partialUpdatedPack.setId(pack.getId());

        partialUpdatedPack
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .discountType(UPDATED_DISCOUNT_TYPE)
            .discountValue(UPDATED_DISCOUNT_VALUE)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .isActive(UPDATED_IS_ACTIVE)
            .displayOnHomepage(UPDATED_DISPLAY_ON_HOMEPAGE);

        restPackMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPack.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPack))
            )
            .andExpect(status().isOk());

        // Validate the Pack in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPackUpdatableFieldsEquals(partialUpdatedPack, getPersistedPack(partialUpdatedPack));
    }

    @Test
    @Transactional
    void patchNonExistingPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, packDTO.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(packDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(packDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPack() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pack.setId(longCount.incrementAndGet());

        // Create the Pack
        PackDTO packDTO = packMapper.toDto(pack);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(packDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Pack in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePack() throws Exception {
        // Initialize the database
        insertedPack = packRepository.saveAndFlush(pack);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the pack
        restPackMockMvc
            .perform(delete(ENTITY_API_URL_ID, pack.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return packRepository.count();
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

    protected Pack getPersistedPack(Pack pack) {
        return packRepository.findById(pack.getId()).orElseThrow();
    }

    protected void assertPersistedPackToMatchAllProperties(Pack expectedPack) {
        assertPackAllPropertiesEquals(expectedPack, getPersistedPack(expectedPack));
    }

    protected void assertPersistedPackToMatchUpdatableProperties(Pack expectedPack) {
        assertPackAllUpdatablePropertiesEquals(expectedPack, getPersistedPack(expectedPack));
    }
}
