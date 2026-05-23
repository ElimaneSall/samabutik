package sn.samabutik.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static sn.samabutik.domain.PackItemAsserts.*;
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
import sn.samabutik.domain.PackItem;
import sn.samabutik.repository.PackItemRepository;
import sn.samabutik.service.dto.PackItemDTO;
import sn.samabutik.service.mapper.PackItemMapper;

/**
 * Integration tests for the {@link PackItemResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PackItemResourceIT {

    private static final Integer DEFAULT_QUANTITY = 1;
    private static final Integer UPDATED_QUANTITY = 2;

    private static final String ENTITY_API_URL = "/api/pack-items";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PackItemRepository packItemRepository;

    @Autowired
    private PackItemMapper packItemMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPackItemMockMvc;

    private PackItem packItem;

    private PackItem insertedPackItem;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PackItem createEntity() {
        return new PackItem().quantity(DEFAULT_QUANTITY);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PackItem createUpdatedEntity() {
        return new PackItem().quantity(UPDATED_QUANTITY);
    }

    @BeforeEach
    void initTest() {
        packItem = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPackItem != null) {
            packItemRepository.delete(insertedPackItem);
            insertedPackItem = null;
        }
    }

    @Test
    @Transactional
    void createPackItem() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);
        var returnedPackItemDTO = om.readValue(
            restPackItemMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packItemDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PackItemDTO.class
        );

        // Validate the PackItem in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPackItem = packItemMapper.toEntity(returnedPackItemDTO);
        assertPackItemUpdatableFieldsEquals(returnedPackItem, getPersistedPackItem(returnedPackItem));

        insertedPackItem = returnedPackItem;
    }

    @Test
    @Transactional
    void createPackItemWithExistingId() throws Exception {
        // Create the PackItem with an existing ID
        packItem.setId(1L);
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPackItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packItemDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQuantityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        packItem.setQuantity(null);

        // Create the PackItem, which fails.
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        restPackItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPackItems() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        // Get all the packItemList
        restPackItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(packItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(DEFAULT_QUANTITY)));
    }

    @Test
    @Transactional
    void getPackItem() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        // Get the packItem
        restPackItemMockMvc
            .perform(get(ENTITY_API_URL_ID, packItem.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(packItem.getId().intValue()))
            .andExpect(jsonPath("$.quantity").value(DEFAULT_QUANTITY));
    }

    @Test
    @Transactional
    void getNonExistingPackItem() throws Exception {
        // Get the packItem
        restPackItemMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPackItem() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the packItem
        PackItem updatedPackItem = packItemRepository.findById(packItem.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPackItem are not directly saved in db
        em.detach(updatedPackItem);
        updatedPackItem.quantity(UPDATED_QUANTITY);
        PackItemDTO packItemDTO = packItemMapper.toDto(updatedPackItem);

        restPackItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, packItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(packItemDTO))
            )
            .andExpect(status().isOk());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPackItemToMatchAllProperties(updatedPackItem);
    }

    @Test
    @Transactional
    void putNonExistingPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, packItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(packItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(packItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(packItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePackItemWithPatch() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the packItem using partial update
        PackItem partialUpdatedPackItem = new PackItem();
        partialUpdatedPackItem.setId(packItem.getId());

        restPackItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPackItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPackItem))
            )
            .andExpect(status().isOk());

        // Validate the PackItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPackItemUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPackItem, packItem), getPersistedPackItem(packItem));
    }

    @Test
    @Transactional
    void fullUpdatePackItemWithPatch() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the packItem using partial update
        PackItem partialUpdatedPackItem = new PackItem();
        partialUpdatedPackItem.setId(packItem.getId());

        partialUpdatedPackItem.quantity(UPDATED_QUANTITY);

        restPackItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPackItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPackItem))
            )
            .andExpect(status().isOk());

        // Validate the PackItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPackItemUpdatableFieldsEquals(partialUpdatedPackItem, getPersistedPackItem(partialUpdatedPackItem));
    }

    @Test
    @Transactional
    void patchNonExistingPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, packItemDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(packItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(packItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPackItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        packItem.setId(longCount.incrementAndGet());

        // Create the PackItem
        PackItemDTO packItemDTO = packItemMapper.toDto(packItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPackItemMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(packItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PackItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePackItem() throws Exception {
        // Initialize the database
        insertedPackItem = packItemRepository.saveAndFlush(packItem);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the packItem
        restPackItemMockMvc
            .perform(delete(ENTITY_API_URL_ID, packItem.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return packItemRepository.count();
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

    protected PackItem getPersistedPackItem(PackItem packItem) {
        return packItemRepository.findById(packItem.getId()).orElseThrow();
    }

    protected void assertPersistedPackItemToMatchAllProperties(PackItem expectedPackItem) {
        assertPackItemAllPropertiesEquals(expectedPackItem, getPersistedPackItem(expectedPackItem));
    }

    protected void assertPersistedPackItemToMatchUpdatableProperties(PackItem expectedPackItem) {
        assertPackItemAllUpdatablePropertiesEquals(expectedPackItem, getPersistedPackItem(expectedPackItem));
    }
}
