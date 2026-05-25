package sn.samabutik.web.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.domain.Media;
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.PackItem;
import sn.samabutik.domain.Product;
import sn.samabutik.repository.MediaRepository;
import sn.samabutik.repository.PackItemRepository;
import sn.samabutik.repository.PackRepository;
import sn.samabutik.repository.ProductRepository;
import sn.samabutik.service.MediaService;
import sn.samabutik.service.MediaStorageService;
import sn.samabutik.service.PackService;
import sn.samabutik.service.criteria.PackSpecifications;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.dto.PackItemDTO;
import sn.samabutik.service.mapper.PackMapper;
import sn.samabutik.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link sn.samabutik.domain.Pack}.
 */
@RestController
@RequestMapping("/api/packs")
public class PackResource {

    private static final Logger LOG = LoggerFactory.getLogger(PackResource.class);
    private static final String ENTITY_NAME = "pack";

    @Value("${jhipster.clientApp.name:samabutik}")
    private String applicationName;

    private final PackService packService;
    private final PackRepository packRepository;
    private final PackItemRepository packItemRepository;
    private final ProductRepository productRepository;
    private final MediaStorageService mediaStorageService;
    private final MediaService mediaService;
    private final MediaRepository mediaRepository;
    private final PackMapper packMapper;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public PackResource(
        PackService packService,
        PackRepository packRepository,
        PackItemRepository packItemRepository,
        ProductRepository productRepository,
        MediaStorageService mediaStorageService,
        MediaService mediaService,
        MediaRepository mediaRepository,
        PackMapper packMapper,
        ObjectMapper objectMapper
    ) {
        this.packService = packService;
        this.packRepository = packRepository;
        this.packItemRepository = packItemRepository;
        this.productRepository = productRepository;
        this.mediaStorageService = mediaStorageService;
        this.mediaService = mediaService;
        this.mediaRepository = mediaRepository;
        this.packMapper = packMapper;
        this.objectMapper = objectMapper;
    }

    // ========================================================================
    // CREATE - Pack with media upload
    // ========================================================================
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<PackDTO> createPackWithMedia(
        @RequestPart("pack") String packJson,
        @RequestPart(value = "mainFile", required = false) MultipartFile mainFile,
        @RequestPart(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles
    ) throws IOException, URISyntaxException {
        LOG.debug("REST request to create Pack with media: {}", packJson);

        PackDTO packDTO;
        try {
            packDTO = objectMapper.readValue(packJson, PackDTO.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestAlertException("Invalid pack JSON", ENTITY_NAME, "json.invalid");
        }

        if (packDTO.getId() != null) {
            throw new BadRequestAlertException("A new pack cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Sauvegarder le pack d'abord (sans les items)
        PackDTO savedPackDTO = packService.save(packDTO);
        Pack pack = packMapper.toEntity(savedPackDTO);

        try {
            // Handle main media
            if (mainFile != null && !mainFile.isEmpty()) {
                Media mainMedia = uploadAndLinkMediaEntity(mainFile, pack, true);
                pack.setMainMedia(mainMedia);
            }

            // Handle gallery files
            if (galleryFiles != null) {
                for (MultipartFile file : galleryFiles) {
                    if (file != null && !file.isEmpty()) {
                        if (
                            mainFile != null &&
                            file.getOriginalFilename().equals(mainFile.getOriginalFilename()) &&
                            file.getSize() == mainFile.getSize()
                        ) {
                            continue;
                        }
                        Media galleryMedia = uploadAndLinkMediaEntity(file, pack, false);
                        pack.getGalleries().add(galleryMedia);
                    }
                }
            }

            // ============================================================
            // NOUVEAU : Gérer les PackItems
            // ============================================================
            if (packDTO.getPackItems() != null && !packDTO.getPackItems().isEmpty()) {
                LOG.debug("Saving {} pack items for pack {}", packDTO.getPackItems().size(), pack.getId());

                for (PackItemDTO itemDTO : packDTO.getPackItems()) {
                    PackItem packItem = new PackItem();
                    packItem.setQuantity(itemDTO.getQuantity());
                    packItem.setPack(pack);

                    // Récupérer le produit depuis la base de données
                    if (itemDTO.getProduct() != null && itemDTO.getProduct().getId() != null) {
                        Product product = productRepository
                            .findById(itemDTO.getProduct().getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDTO.getProduct().getId()));
                        packItem.setProduct(product);
                        LOG.debug("Adding product {} to pack item", product.getId());
                    }

                    // Ajouter au pack et persister
                    pack.addPackItem(packItem);
                    entityManager.persist(packItem);
                }
            }

            // Sauvegarder le pack avec toutes ses relations
            pack = packRepository.save(pack);
            entityManager.flush();

            // Rafraîchir pour charger toutes les relations
            entityManager.refresh(pack);

            // Récupérer le pack complet avec tous les items
            PackDTO result = packMapper.toDto(
                packRepository
                    .findByIdWithMediaAndItems(pack.getId())
                    .orElseThrow(() -> new RuntimeException("Pack not found after creation"))
            );

            LOG.debug("Pack created successfully with {} pack items", result.getPackItems().size());

            return ResponseEntity.created(new URI("/api/packs/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            LOG.error("Failed to upload media for pack {}, deleting pack", savedPackDTO.getId(), e);
            packService.delete(savedPackDTO.getId());
            throw new RuntimeException("Échec de l'upload des médias: " + e.getMessage(), e);
        }
    }

    // ========================================================================
    // UPDATE - Pack with media upload support
    // ========================================================================
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<PackDTO> updatePackWithMedia(
        @PathVariable Long id,
        @RequestPart("pack") String packJson,
        @RequestPart(value = "mainFile", required = false) MultipartFile mainFile,
        @RequestPart(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles
    ) throws IOException {
        LOG.debug("REST request to update Pack with media: {}, {}", id, packJson);

        PackDTO packDTO;
        try {
            packDTO = objectMapper.readValue(packJson, PackDTO.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestAlertException("Invalid pack JSON", ENTITY_NAME, "json.invalid");
        }

        if (packDTO.getId() == null || !Objects.equals(id, packDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Pack pack = packRepository
            .findByIdWithMediaAndItems(id)
            .orElseThrow(() -> new BadRequestAlertException("Pack not found", ENTITY_NAME, "idnotfound"));

        try {
            // Update basic fields
            pack.setName(packDTO.getName());
            pack.setDescription(packDTO.getDescription());
            pack.setStartDate(packDTO.getStartDate());
            pack.setEndDate(packDTO.getEndDate());
            pack.setDiscountType(packDTO.getDiscountType());
            pack.setDiscountValue(packDTO.getDiscountValue());
            pack.setIsActive(packDTO.getIsActive());
            pack.setDisplayOnHomepage(packDTO.getDisplayOnHomepage());

            // ─────────────────────────────────────────────────────────────
            // Gestion du MAIN media
            // ─────────────────────────────────────────────────────────────
            if (mainFile != null && !mainFile.isEmpty()) {
                Media oldMain = pack.getMainMedia();
                if (oldMain != null && oldMain.getUrl() != null) {
                    mediaStorageService.deleteFile(oldMain.getUrl());
                }
                Media newMainMedia = uploadAndLinkMediaEntity(mainFile, pack, true);
                pack.setMainMedia(newMainMedia);
            }

            // ─────────────────────────────────────────────────────────────
            // Gestion de la GALLERY
            // ─────────────────────────────────────────────────────────────
            Set<Long> keptGalleryIds = new HashSet<>();
            if (packDTO.getGalleries() != null) {
                for (MediaDTO media : packDTO.getGalleries()) {
                    if (media.getId() != null) {
                        keptGalleryIds.add(media.getId());
                    }
                }
            }

            Iterator<Media> galleryIterator = pack.getGalleries().iterator();
            while (galleryIterator.hasNext()) {
                Media media = galleryIterator.next();
                if (media.getId() != null && !keptGalleryIds.contains(media.getId())) {
                    galleryIterator.remove();
                    media.setPackGallery(null);
                    if (media.getUrl() != null) {
                        mediaStorageService.deleteFile(media.getUrl());
                    }
                }
            }

            if (galleryFiles != null) {
                for (MultipartFile file : galleryFiles) {
                    if (file != null && !file.isEmpty()) {
                        if (
                            mainFile != null &&
                            file.getOriginalFilename().equals(mainFile.getOriginalFilename()) &&
                            file.getSize() == mainFile.getSize()
                        ) {
                            continue;
                        }
                        Media newGalleryMedia = uploadAndLinkMediaEntity(file, pack, false);
                        pack.getGalleries().add(newGalleryMedia);
                    }
                }
            }

            // ─────────────────────────────────────────────────────────────
            // NOUVEAU : Gestion des PackItems
            // ─────────────────────────────────────────────────────────────
            // Supprimer les anciens packItems
            if (!pack.getPackItems().isEmpty()) {
                LOG.debug("Removing {} existing pack items", pack.getPackItems().size());
                pack.getPackItems().clear();
                entityManager.flush(); // Pour forcer la suppression
            }

            // Ajouter les nouveaux packItems
            if (packDTO.getPackItems() != null && !packDTO.getPackItems().isEmpty()) {
                LOG.debug("Adding {} new pack items", packDTO.getPackItems().size());
                for (PackItemDTO itemDTO : packDTO.getPackItems()) {
                    PackItem packItem = new PackItem();
                    packItem.setQuantity(itemDTO.getQuantity());
                    packItem.setPack(pack);

                    // Récupérer le produit depuis la base de données
                    if (itemDTO.getProduct() != null && itemDTO.getProduct().getId() != null) {
                        Product product = productRepository
                            .findById(itemDTO.getProduct().getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDTO.getProduct().getId()));
                        packItem.setProduct(product);
                        LOG.debug("  - Adding product ID: {} with quantity: {}", product.getId(), itemDTO.getQuantity());
                    } else {
                        throw new RuntimeException("Product ID is required for pack item");
                    }

                    pack.addPackItem(packItem);
                    entityManager.persist(packItem);
                }
            }

            // Single save with flush
            pack = packRepository.save(pack);
            entityManager.flush();

            // Recharger le pack complet avec tous les items
            PackDTO result = packMapper.toDto(
                packRepository.findByIdWithMediaAndItems(id).orElseThrow(() -> new RuntimeException("Pack not found after update"))
            );

            LOG.debug("Pack updated successfully with {} pack items", result.getPackItems().size());

            return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            LOG.error("Failed to update media for pack {}", id, e);
            throw new RuntimeException("Échec de la mise à jour des médias: " + e.getMessage(), e);
        }
    }

    // ========================================================================
    // UPDATE - Pack JSON only (no media)
    // ========================================================================
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PackDTO> updatePack(@PathVariable Long id, @Valid @RequestBody PackDTO packDTO) throws URISyntaxException {
        LOG.debug("REST request to update Pack (JSON) : {}, {}", id, packDTO);

        if (packDTO.getId() == null || !Objects.equals(id, packDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        // Charger le pack existant avec ses relations
        Pack existingPack = packRepository
            .findByIdWithMediaAndItems(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

        try {
            // Mettre à jour les champs de base
            existingPack.setName(packDTO.getName());
            existingPack.setDescription(packDTO.getDescription());
            existingPack.setStartDate(packDTO.getStartDate());
            existingPack.setEndDate(packDTO.getEndDate());
            existingPack.setDiscountType(packDTO.getDiscountType());
            existingPack.setDiscountValue(packDTO.getDiscountValue());
            existingPack.setIsActive(packDTO.getIsActive());
            existingPack.setDisplayOnHomepage(packDTO.getDisplayOnHomepage());

            // ─────────────────────────────────────────────────────────────
            // Gestion des PackItems
            // ─────────────────────────────────────────────────────────────
            // Supprimer les anciens packItems
            if (!existingPack.getPackItems().isEmpty()) {
                LOG.debug("Removing {} existing pack items", existingPack.getPackItems().size());
                existingPack.getPackItems().clear();
                entityManager.flush();
            }

            // Ajouter les nouveaux packItems
            if (packDTO.getPackItems() != null && !packDTO.getPackItems().isEmpty()) {
                LOG.debug("Adding {} new pack items", packDTO.getPackItems().size());
                for (PackItemDTO itemDTO : packDTO.getPackItems()) {
                    PackItem packItem = new PackItem();
                    packItem.setQuantity(itemDTO.getQuantity());
                    packItem.setPack(existingPack);

                    // Récupérer le produit
                    if (itemDTO.getProduct() != null && itemDTO.getProduct().getId() != null) {
                        Product product = productRepository
                            .findById(itemDTO.getProduct().getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDTO.getProduct().getId()));
                        packItem.setProduct(product);
                        LOG.debug("  - Adding product ID: {} with quantity: {}", product.getId(), itemDTO.getQuantity());
                    } else {
                        throw new RuntimeException("Product ID is required for pack item");
                    }

                    existingPack.addPackItem(packItem);
                    entityManager.persist(packItem);
                }
            }

            // Sauvegarder
            Pack savedPack = packRepository.save(existingPack);
            entityManager.flush();

            // Recharger avec toutes les relations
            PackDTO result = packMapper.toDto(
                packRepository
                    .findByIdWithMediaAndItems(savedPack.getId())
                    .orElseThrow(() -> new RuntimeException("Pack not found after update"))
            );

            LOG.debug("Pack updated successfully with {} pack items", result.getPackItems().size());

            return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            LOG.error("Failed to update pack {}", id, e);
            throw new RuntimeException("Échec de la mise à jour du pack: " + e.getMessage(), e);
        }
    }

    // ========================================================================
    // PATCH - Partial update
    // ========================================================================
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PackDTO> partialUpdatePack(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PackDTO packDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Pack partially : {}, {}", id, packDTO);
        if (packDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, packDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!packRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PackDTO> result = packService.partialUpdate(packDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, packDTO.getId().toString())
        );
    }

    // ========================================================================
    // GET - All packs
    // ========================================================================
    @GetMapping("")
    public ResponseEntity<List<PackDTO>> getAllPacks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "discountType", required = false) String discountType,
        @RequestParam(name = "displayOnHomepage", required = false) Boolean displayOnHomepage
    ) {
        LOG.debug(
            "REST request to get packs : {}, search={}, discountType={}, displayOnHomepage={}",
            pageable,
            search,
            discountType,
            displayOnHomepage
        );

        Specification<Pack> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            spec = spec.and(PackSpecifications.searchByName(search));
        }
        if (discountType != null && !discountType.isBlank()) {
            spec = spec.and(PackSpecifications.byDiscountType(discountType));
        }
        if (displayOnHomepage != null) {
            spec = spec.and(PackSpecifications.byDisplayOnHomepage(displayOnHomepage));
        }

        Page<PackDTO> page = packService.findAll(spec, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    // ========================================================================
    // GET - Single pack
    // ========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<PackDTO> getPack(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Pack : {}", id);
        Optional<PackDTO> packDTO = packService.findOne(id);
        return ResponseUtil.wrapOrNotFound(packDTO);
    }

    // ========================================================================
    // DELETE - Pack
    // ========================================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePack(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Pack : {}", id);
        packService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    // ========================================================================
    // HELPERS - Media upload and linking
    // ========================================================================

    private Media uploadAndLinkMediaEntity(MultipartFile file, Pack pack, boolean isMain) throws IOException {
        MediaStorageService.MediaUploadResult result = mediaStorageService.uploadFile(file, "pack", pack.getId());

        Media media = new Media();
        media.setUrl(result.url());
        media.setType(result.type());
        media.setFormat(result.format());
        media.setSizeBytes(result.sizeBytes().intValue());
        media.setIsMain(isMain);
        media.setDisplayOrder(0);
        media.setAltText(file.getOriginalFilename());
        media.setUploadedAt(Instant.now());

        media.setPackGallery(pack);
        entityManager.persist(media);

        return media;
    }
}
