package sn.samabutik.web.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.domain.Product;
import sn.samabutik.repository.ProductRepository;
import sn.samabutik.service.MediaService;
import sn.samabutik.service.MediaStorageService;
import sn.samabutik.service.ProductService;
import sn.samabutik.service.criteria.ProductSpecifications;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.ProductDTO;
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

    public ProductResource(
        ProductService productService,
        ProductRepository productRepository,
        MediaStorageService mediaStorageService,
        MediaService mediaService,
        ObjectMapper objectMapper
    ) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.mediaStorageService = mediaStorageService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
    }

    /**
     * {@code POST  /products} : Create a new product.
     *
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new productDTO, or with status {@code 400 (Bad Request)} if the product has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProductWithMedia(
        @RequestPart("product") String productJson,
        @RequestPart(value = "mainFile", required = false) MultipartFile mainFile,
        @RequestPart(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles
    ) throws IOException, URISyntaxException {
        LOG.debug("REST request to create Product with media: {}", productJson);

        // 1. Parse JSON product data
        ProductDTO productDTO;
        try {
            productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestAlertException("Invalid product JSON", "product", "json.invalid");
        }

        // 2. Validate business rules
        if (productDTO.getId() != null) {
            throw new BadRequestAlertException("A new product cannot already have an ID", "product", "idexists");
        }
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new BadRequestAlertException("SKU already exists: " + productDTO.getSku(), "product", "sku.unique");
        }

        // 3. Save product first to get ID
        ProductDTO savedProduct = productService.save(productDTO);

        try {
            // 4. Upload MAIN file if provided
            if (mainFile != null && !mainFile.isEmpty()) {
                MediaDTO mainMedia = uploadAndLinkMedia(mainFile, savedProduct.getId(), true);
                savedProduct.setMainMedia(mainMedia);
                productService.update(savedProduct); // Update to link mainMedia
            }

            // 5. Upload GALLERY files if provided
            if (galleryFiles != null) {
                for (MultipartFile file : galleryFiles) {
                    if (file != null && !file.isEmpty()) {
                        // Skip if same file as main (avoid duplicate)
                        if (
                            mainFile != null &&
                            file.getOriginalFilename().equals(mainFile.getOriginalFilename()) &&
                            file.getSize() == mainFile.getSize()
                        ) {
                            continue;
                        }
                        uploadAndLinkMedia(file, savedProduct.getId(), false);
                    }
                }
            }

            // 6. Return product with linked media (fetch fresh with eager loading)
            ProductDTO result = productService
                .findOne(savedProduct.getId())
                .orElseThrow(() -> new RuntimeException("Product not found after creation"));

            return ResponseEntity.created(new URI("/api/products/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "product", result.getId().toString()))
                .body(result);
        } catch (Exception e) {
            // Rollback: delete product if media upload fails
            LOG.error("Failed to upload media for product {}, deleting product", savedProduct.getId(), e);
            productService.delete(savedProduct.getId());
            throw new RuntimeException("Échec de l'upload des médias: " + e.getMessage(), e);
        }
    }

    /**
     * Helper: Upload file + create Media entity + link to product gallery
     */
    private MediaDTO uploadAndLinkMedia(MultipartFile file, Long productId, boolean isMain) throws IOException {
        // Upload to local storage
        MediaStorageService.MediaUploadResult result = mediaStorageService.uploadFile(file, "product", productId);

        // Create Media entity
        MediaDTO mediaDTO = new MediaDTO();
        mediaDTO.setUrl(result.url());
        mediaDTO.setType(result.type());
        mediaDTO.setFormat(result.format());
        mediaDTO.setSizeBytes(result.sizeBytes().intValue());
        mediaDTO.setWidth(extractImageWidth(file)); // Optional: use metadata extractor
        mediaDTO.setHeight(extractImageHeight(file));
        mediaDTO.setDurationSec(extractVideoDuration(file)); // Optional: use FFmpeg wrapper
        mediaDTO.setIsMain(isMain);
        mediaDTO.setDisplayOrder(0); // Will be updated if needed
        mediaDTO.setAltText(file.getOriginalFilename());
        mediaDTO.setUploadedAt(Instant.now());

        // Link to product gallery (ManyToOne)
        ProductDTO productRef = new ProductDTO();
        productRef.setId(productId);
        mediaDTO.setProductGallery(productRef);

        return mediaService.save(mediaDTO);
    }

    // Optional helpers for metadata extraction (simplified)
    private Integer extractImageWidth(MultipartFile file) {
        return null;
    } // TODO: Use Thumbnailator/metadata-extractor

    private Integer extractImageHeight(MultipartFile file) {
        return null;
    }

    private Integer extractVideoDuration(MultipartFile file) {
        return null;
    } // TODO: Use JAVE2/FFmpeg

    /**
     * {@code PUT  /products/:id} : Updates an existing product.
     *
     * @param id the id of the productDTO to save.
     * @param productDTO the productDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productDTO,
     * or with status {@code 400 (Bad Request)} if the productDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the productDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ProductDTO productDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Product : {}, {}", id, productDTO);
        if (productDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        productDTO = productService.update(productDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productDTO.getId().toString()))
            .body(productDTO);
    }

    /**
     * {@code PATCH  /products/:id} : Partial updates given fields of an existing product, field will ignore if it is null
     *
     * @param id the id of the productDTO to save.
     * @param productDTO the productDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productDTO,
     * or with status {@code 400 (Bad Request)} if the productDTO is not valid,
     * or with status {@code 404 (Not Found)} if the productDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the productDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
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

    /**
     * {@code GET  /products} : get all the Products.
     *
     * @param pageable the pagination information.
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Products in body.
     */
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

        // Exécuter la requête avec pagination
        Page<ProductDTO> page = productService.findAll(spec, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /products/:id} : get the "id" product.
     *
     * @param id the id of the productDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the productDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Product : {}", id);
        Optional<ProductDTO> productDTO = productService.findOne(id);
        return ResponseUtil.wrapOrNotFound(productDTO);
    }

    /**
     * {@code DELETE  /products/:id} : delete the "id" product.
     *
     * @param id the id of the productDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Product : {}", id);
        productService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
