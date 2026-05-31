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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.domain.OrderItem;
import sn.samabutik.repository.OrderItemRepository;
import sn.samabutik.repository.OrderRepository;
import sn.samabutik.service.OrderItemService;
import sn.samabutik.service.criteria.OrderItemSpecifications;
import sn.samabutik.service.dto.OrderItemDTO;
import sn.samabutik.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link sn.samabutik.domain.OrderItem}.
 */
@RestController
@RequestMapping("/api/order-items")
public class OrderItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(OrderItemResource.class);

    private static final String ENTITY_NAME = "orderItem";

    @Value("${jhipster.clientApp.name:samabutik}")
    private String applicationName;

    private final OrderItemService orderItemService;

    private final OrderItemRepository orderItemRepository;

    private final OrderRepository orderRepository;

    public OrderItemResource(OrderItemService orderItemService, OrderItemRepository orderItemRepository, OrderRepository orderRepository) {
        this.orderItemService = orderItemService;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * {@code POST  /order-items} : Create a new orderItem.
     *
     * @param orderItemDTO the orderItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new orderItemDTO, or with status {@code 400 (Bad Request)} if the orderItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<OrderItemDTO> createOrderItem(@Valid @RequestBody OrderItemDTO orderItemDTO) throws URISyntaxException {
        LOG.debug("REST request to save OrderItem : {}", orderItemDTO);
        if (orderItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new orderItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        orderItemDTO = orderItemService.save(orderItemDTO);
        return ResponseEntity.created(new URI("/api/order-items/" + orderItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, orderItemDTO.getId().toString()))
            .body(orderItemDTO);
    }

    /**
     * {@code PUT  /order-items/:id} : Updates an existing orderItem.
     *
     * @param id the id of the orderItemDTO to save.
     * @param orderItemDTO the orderItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated orderItemDTO,
     * or with status {@code 400 (Bad Request)} if the orderItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the orderItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrderItemDTO> updateOrderItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody OrderItemDTO orderItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update OrderItem : {}, {}", id, orderItemDTO);
        if (orderItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!orderItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        orderItemDTO = orderItemService.update(orderItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderItemDTO.getId().toString()))
            .body(orderItemDTO);
    }

    /**
     * {@code PATCH  /order-items/:id} : Partial updates given fields of an existing orderItem, field will ignore if it is null
     *
     * @param id the id of the orderItemDTO to save.
     * @param orderItemDTO the orderItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated orderItemDTO,
     * or with status {@code 400 (Bad Request)} if the orderItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the orderItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the orderItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<OrderItemDTO> partialUpdateOrderItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody OrderItemDTO orderItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update OrderItem partially : {}, {}", id, orderItemDTO);
        if (orderItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!orderItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<OrderItemDTO> result = orderItemService.partialUpdate(orderItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /order-items} : get all the Order Items.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Order Items in body.
     */
    @GetMapping("")
    public ResponseEntity<List<OrderItemDTO>> getAllOrderItems(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "orderId", required = false) Long orderId,
        @RequestParam(name = "isPackItem", required = false) Boolean isPackItem,
        @RequestParam(name = "productId", required = false) Long productId,
        @RequestParam(name = "productName", required = false) String productName,
        @RequestParam(name = "minQuantity", required = false) Integer minQuantity,
        @RequestParam(name = "maxQuantity", required = false) Integer maxQuantity,
        @RequestParam(name = "orderStatus", required = false) sn.samabutik.domain.enumeration.OrderStatus orderStatus,
        @RequestParam(name = "paymentMethod", required = false) sn.samabutik.domain.enumeration.PaymentMethod paymentMethod
    ) {
        LOG.debug("REST request to get a page of OrderItems with filters");

        Specification<OrderItem> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            spec = spec.and(OrderItemSpecifications.searchByProductOrOrder(search));
        }
        if (orderId != null) {
            spec = spec.and(OrderItemSpecifications.byOrderId(orderId));
        }
        if (isPackItem != null) {
            spec = spec.and(OrderItemSpecifications.byIsPackItem(isPackItem));
        }
        if (productId != null) {
            spec = spec.and(OrderItemSpecifications.byProductId(productId));
        }
        if (productName != null && !productName.isBlank()) {
            spec = spec.and(OrderItemSpecifications.byProductName(productName));
        }
        if (minQuantity != null) {
            spec = spec.and(OrderItemSpecifications.byMinQuantity(minQuantity));
        }
        if (maxQuantity != null) {
            spec = spec.and(OrderItemSpecifications.byMaxQuantity(maxQuantity));
        }
        if (orderStatus != null) {
            spec = spec.and(OrderItemSpecifications.byOrderStatus(orderStatus));
        }
        if (paymentMethod != null) {
            spec = spec.and(OrderItemSpecifications.byPaymentMethod(paymentMethod));
        }

        Page<OrderItemDTO> page = orderItemService.findAll(spec, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /order-items/:id} : get the "id" orderItem.
     *
     * @param id the id of the orderItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the orderItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderItemDTO> getOrderItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get OrderItem : {}", id);
        Optional<OrderItemDTO> orderItemDTO = orderItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(orderItemDTO);
    }

    /**
     * {@code DELETE  /order-items/:id} : delete the "id" orderItem.
     *
     * @param id the id of the orderItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete OrderItem : {}", id);
        orderItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderItemDTO> addOrderItem(@PathVariable Long orderId, @Valid @RequestBody OrderItemDTO orderItemDTO)
        throws URISyntaxException {
        LOG.debug("REST request to add OrderItem to Order : {}", orderId);

        if (!orderRepository.existsById(orderId)) {
            throw new BadRequestAlertException("Order not found", "order", "notfound");
        }

        orderItemDTO.setId(null);
        OrderItemDTO result = orderItemService.addItemToOrder(orderId, orderItemDTO);

        return ResponseEntity.created(new URI("/api/order-items/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "order_item", result.getId().toString()))
            .body(result);
    }
}
