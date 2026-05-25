package sn.samabutik.web.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.domain.Media;
import sn.samabutik.domain.Product;
import sn.samabutik.repository.MediaRepository;
import sn.samabutik.repository.ProductRepository;
import sn.samabutik.service.MediaService;
import sn.samabutik.service.MediaStorageService;
import sn.samabutik.service.ProductService;
import sn.samabutik.service.criteria.ProductSpecifications;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.ProductDTO;
import sn.samabutik.service.mapper.ProductMapper;
import sn.samabutik.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link sn.samabutik.domain.Product}.
 */
@RestController
@RequestMapping("/api/products")
public class ProductResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProductResource.class);
    private static final String ENTITY_NAME = "product";

    @Value("${jhipster.clientApp.name:samabutik}")
    private String applicationName;

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final MediaStorageService mediaStorageService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;
    private final MediaRepository mediaRepository;
    private final ProductMapper productMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public ProductResource(
        ProductService productService,
        ProductRepository productRepository,
        MediaStorageService mediaStorageService,
        MediaService mediaService,
        ObjectMapper objectMapper,
        MediaRepository mediaRepository,
        ProductMapper productMapper
    ) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.mediaStorageService = mediaStorageService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
        this.mediaRepository = mediaRepository;
        this.productMapper = productMapper;
    }

    // ========================================================================
    // CREATE - Product with media upload
    // ========================================================================
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<ProductDTO> createProductWithMedia(
        @RequestPart("product") String productJson,
        @RequestPart(value = "mainFile", required = false) MultipartFile mainFile,
        @RequestPart(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles
    ) throws IOException, URISyntaxException {
        LOG.debug("REST request to create Product with media: {}", productJson);

        ProductDTO productDTO;
        try {
            productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestAlertException("Invalid product JSON", "product", "json.invalid");
        }

        if (productDTO.getId() != null) {
            throw new BadRequestAlertException("A new product cannot already have an ID", "product", "idexists");
        }
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new BadRequestAlertException("SKU already exists: " + productDTO.getSku(), "product", "sku.unique");
        }

        ProductDTO savedProductDTO = productService.save(productDTO);
        Product product = productMapper.toEntity(savedProductDTO);

        try {
            if (mainFile != null && !mainFile.isEmpty()) {
                Media mainMedia = uploadAndLinkMediaEntity(mainFile, product, true);
                product.setMainMedia(mainMedia);
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
                        Media galleryMedia = uploadAndLinkMediaEntity(file, product, false);
                        product.getGalleries().add(galleryMedia);
                    }
                }
            }

            // 🔥 Sauvegarder une seule fois à la fin + flush explicite
            product = productRepository.save(product);
            entityManager.flush();
            entityManager.refresh(product);

            ProductDTO result = productMapper.toDto(
                productRepository
                    .findByIdWithMedia(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found after creation"))
            );

            return ResponseEntity.created(new URI("/api/products/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "product", result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            LOG.error("Failed to upload media for product {}, deleting product", savedProductDTO.getId(), e);
            productService.delete(savedProductDTO.getId());
            throw new RuntimeException("Échec de l'upload des médias: " + e.getMessage(), e);
        }
    }

    // ========================================================================
    // UPDATE - Product with media upload support
    // ========================================================================
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<ProductDTO> updateProductWithMedia(
        @PathVariable Long id,
        @RequestPart("product") String productJson,
        @RequestPart(value = "mainFile", required = false) MultipartFile mainFile,
        @RequestPart(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles
    ) throws IOException, URISyntaxException {
        LOG.debug("REST request to update Product with media: {}, {}", id, productJson);

        ProductDTO productDTO;
        try {
            productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestAlertException("Invalid product JSON", "product", "json.invalid");
        }

        if (productDTO.getId() == null || !Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Product product = productRepository
            .findByIdWithMedia(id)
            .orElseThrow(() -> new BadRequestAlertException("Product not found", ENTITY_NAME, "idnotfound"));

        try {
            // Mise à jour des champs de base
            product.setSku(productDTO.getSku());
            product.setName(productDTO.getName());
            product.setDescription(productDTO.getDescription());
            product.setPrice(productDTO.getPrice());
            product.setCostPrice(productDTO.getCostPrice());
            product.setCurrency(productDTO.getCurrency());
            product.setStock(productDTO.getStock());
            product.setLowStockThreshold(productDTO.getLowStockThreshold());
            product.setCategory(productDTO.getCategory());
            product.setIsActive(productDTO.getIsActive());

            // ─────────────────────────────────────────────────────────────
            // Gestion du MAIN media — avec orphanRemoval, plus simple
            // ─────────────────────────────────────────────────────────────
            if (mainFile != null && !mainFile.isEmpty()) {
                // L'ancien mainMedia sera supprimé automatiquement par orphanRemoval
                // quand on fait setMainMedia(null) ou setMainMedia(nouveau)
                Media oldMain = product.getMainMedia();
                if (oldMain != null && oldMain.getUrl() != null) {
                    mediaStorageService.deleteFile(oldMain.getUrl());
                }

                Media newMainMedia = uploadAndLinkMediaEntity(mainFile, product, true);
                product.setMainMedia(newMainMedia); // ← Cascade.ALL persistera auto
            }

            // ─────────────────────────────────────────────────────────────
            // Gestion de la GALLERY — avec orphanRemoval
            // ─────────────────────────────────────────────────────────────
            Set<Long> keptGalleryIds = new HashSet<>();
            if (productDTO.getGallery() != null) {
                for (MediaDTO media : productDTO.getGallery()) {
                    if (media.getId() != null) {
                        keptGalleryIds.add(media.getId());
                    }
                }
            }

            Iterator<Media> galleryIterator = product.getGalleries().iterator();
            while (galleryIterator.hasNext()) {
                Media media = galleryIterator.next();
                if (media.getId() != null && !keptGalleryIds.contains(media.getId())) {
                    galleryIterator.remove(); // ← orphanRemoval supprime en DB
                    media.setProductGallery(null);
                    if (media.getUrl() != null) {
                        mediaStorageService.deleteFile(media.getUrl());
                    }
                }
            }

            // Ajouter nouveaux fichiers gallery
            if (galleryFiles != null) {
                for (MultipartFile file : galleryFiles) {
                    if (file != null && !file.isEmpty()) {
                        // Éviter doublon avec mainFile
                        if (
                            mainFile != null &&
                            file.getOriginalFilename().equals(mainFile.getOriginalFilename()) &&
                            file.getSize() == mainFile.getSize()
                        ) {
                            continue;
                        }
                        Media newGalleryMedia = uploadAndLinkMediaEntity(file, product, false);
                        product.getGalleries().add(newGalleryMedia); // ← Cascade.ALL persistera auto
                    }
                }
            }

            // Un seul save suffit avec cascade
            product = productRepository.save(product);
            entityManager.flush();

            ProductDTO result = productMapper.toDto(
                productRepository.findByIdWithMedia(id).orElseThrow(() -> new RuntimeException("Product not found after update"))
            );

            return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            LOG.error("Failed to update media for product {}", id, e);
            throw new RuntimeException("Échec de la mise à jour des médias: " + e.getMessage(), e);
        }
    }

    // ========================================================================
    // UPDATE - Product JSON only (no media)
    // ========================================================================
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) throws URISyntaxException {
        LOG.debug("REST request to update Product (JSON) : {}, {}", id, productDTO);

        if (productDTO.getId() == null || !Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!productRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ProductDTO result = productService.update(productDTO);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    // ========================================================================
    // PATCH - Partial update
    // ========================================================================
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProductDTO> partialUpdateProduct(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProductDTO productDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Product partially : {}, {}", id, productDTO);
        if (productDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProductDTO> result = productService.partialUpdate(productDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productDTO.getId().toString())
        );
    }

    // ========================================================================
    // GET - All products with filtering
    // ========================================================================
    @GetMapping("")
    public ResponseEntity<List<ProductDTO>> getAllProducts(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "filter", required = false) String filter,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "category", required = false) String category,
        @RequestParam(name = "stockFilter", required = false) String stockFilter
    ) {
        LOG.debug("REST request to get products : {}, search={}, category={}, stockFilter={}", pageable, search, category, stockFilter);

        if ("orderitem-is-null".equals(filter)) {
            LOG.debug("REST request to get all Products where orderItem is null");
            return new ResponseEntity<>(productService.findAllWhereOrderItemIsNull(), HttpStatus.OK);
        }

        Specification<Product> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            spec = spec.and(ProductSpecifications.searchByNameOrSku(search));
        }
        if (category != null && !category.isBlank()) {
            spec = spec.and(ProductSpecifications.byCategory(category));
        }
        if (stockFilter != null && !stockFilter.equals("all")) {
            spec = spec.and(ProductSpecifications.byStockStatus(stockFilter));
        }

        Page<ProductDTO> page = productService.findAll(spec, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    // ========================================================================
    // GET - Single product
    // ========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Product : {}", id);
        Optional<ProductDTO> productDTO = productService.findOne(id);
        return ResponseUtil.wrapOrNotFound(productDTO);
    }

    // ========================================================================
    // DELETE - Product
    // ========================================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Product : {}", id);
        productService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    // ========================================================================
    // HELPERS - Media upload and linking (CORRIGÉ)
    // ========================================================================

    /**
     * Helper: Upload file + create Media entity + link to product
     * 🔥 Utilise entityManager.persist() pour garantir que l'entité est dans le bon contexte
     */
    private Media uploadAndLinkMediaEntity(MultipartFile file, Product product, boolean isMain) throws IOException {
        MediaStorageService.MediaUploadResult result = mediaStorageService.uploadFile(file, "product", product.getId());

        Media media = new Media();
        media.setUrl(result.url());
        media.setType(result.type());
        media.setFormat(result.format());
        media.setSizeBytes(result.sizeBytes().intValue());
        media.setIsMain(isMain);
        media.setDisplayOrder(0);
        media.setAltText(file.getOriginalFilename());
        media.setUploadedAt(Instant.now());

        // 🔗 Relation bidirectionnelle
        media.setProductGallery(product);

        // 🔥 Utiliser entityManager.persist() au lieu de repository.save()
        // Cela garantit que l'entité est persistée dans le MÊME contexte que Product
        entityManager.persist(media);

        // 🔥 Flush optionnel ici si vous voulez être ultra-sûr (mais le flush final suffit)
        // entityManager.flush();

        return media;
    }

    /**
     * Helper for createProductWithMedia (utilise DTO avant que l'entité n'existe)
     */
    private MediaDTO uploadAndLinkMedia(MultipartFile file, Long productId, boolean isMain) throws IOException {
        MediaStorageService.MediaUploadResult result = mediaStorageService.uploadFile(file, "product", productId);

        MediaDTO mediaDTO = new MediaDTO();
        mediaDTO.setUrl(result.url());
        mediaDTO.setType(result.type());
        mediaDTO.setFormat(result.format());
        mediaDTO.setSizeBytes(result.sizeBytes().intValue());
        mediaDTO.setWidth(extractImageWidth(file));
        mediaDTO.setHeight(extractImageHeight(file));
        mediaDTO.setDurationSec(extractVideoDuration(file));
        mediaDTO.setIsMain(isMain);
        mediaDTO.setDisplayOrder(0);
        mediaDTO.setAltText(file.getOriginalFilename());
        mediaDTO.setUploadedAt(Instant.now());

        ProductDTO productRef = new ProductDTO();
        productRef.setId(productId);
        mediaDTO.setProductGallery(productRef);

        return mediaService.save(mediaDTO);
    }

    private Integer extractImageWidth(MultipartFile file) {
        return null;
    }

    private Integer extractImageHeight(MultipartFile file) {
        return null;
    }

    private Integer extractVideoDuration(MultipartFile file) {
        return null;
    }
}
