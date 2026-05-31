package sn.samabutik.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import sn.samabutik.domain.enumeration.OrderStatus;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;
import sn.samabutik.repository.OrderRepository;
import sn.samabutik.service.OrderItemService;
import sn.samabutik.service.OrderService;
import sn.samabutik.service.PaymentTransactionService;
import sn.samabutik.service.dto.*;
import sn.samabutik.web.rest.errors.BadRequestAlertException;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/orders")
public class OrderResource {

    private static final Logger LOG = LoggerFactory.getLogger(OrderResource.class);
    private static final String ENTITY_NAME = "order";

    @Value("${jhipster.clientApp.name:samabutik}")
    private String applicationName;

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final OrderItemService orderItemService;
    private final PaymentTransactionService paymentService;

    public OrderResource(
        OrderService orderService,
        OrderRepository orderRepository,
        OrderItemService orderItemService,
        PaymentTransactionService paymentService
    ) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.orderItemService = orderItemService;
        this.paymentService = paymentService;
    }

    @PostMapping("")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) throws URISyntaxException {
        LOG.debug("REST request to save Order : {}", orderDTO);
        if (orderDTO.getId() != null) {
            throw new BadRequestAlertException("A new order cannot already have an ID", ENTITY_NAME, "idexists");
        }

        if (orderDTO.getOrderNumber() == null || orderDTO.getOrderNumber().isEmpty()) {
            orderDTO.setOrderNumber(generateOrderNumber());
        }

        if (orderDTO.getShippingAddress() == null) {
            orderDTO.setShippingAddress("");
        }

        orderDTO = orderService.save(orderDTO);
        return ResponseEntity.created(new URI("/api/orders/" + orderDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, orderDTO.getId().toString()))
            .body(orderDTO);
    }

    private String generateOrderNumber() {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = java.time.LocalDateTime.now().format(formatter);
        String random = String.valueOf((int) (Math.random() * 10000));
        return "ORD-" + timestamp + "-" + random;
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody OrderDTO orderDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Order : {}, {}", id, orderDTO);
        if (orderDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!orderRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        orderDTO = orderService.update(orderDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderDTO.getId().toString()))
            .body(orderDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<OrderDTO> partialUpdateOrder(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody OrderDTO orderDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Order partially : {}, {}", id, orderDTO);
        if (orderDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!orderRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<OrderDTO> result = orderService.partialUpdate(orderDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderDTO.getId().toString())
        );
    }

    @GetMapping("")
    public ResponseEntity<List<OrderDTO>> getAllOrders(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "status", required = false) OrderStatus status,
        @RequestParam(name = "paymentMethod", required = false) PaymentMethod paymentMethod,
        @RequestParam(name = "paymentStatus", required = false) PaymentStatus paymentStatus
    ) {
        LOG.debug(
            "REST request to get Orders : {}, search={}, status={}, paymentMethod={}, paymentStatus={}",
            pageable,
            search,
            status,
            paymentMethod,
            paymentStatus
        );

        org.springframework.data.jpa.domain.Specification<sn.samabutik.domain.Order> spec =
            org.springframework.data.jpa.domain.Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            spec = spec.and(sn.samabutik.service.criteria.OrderSpecifications.searchByNumberOrCustomer(search));
        }
        if (status != null) {
            spec = spec.and(sn.samabutik.service.criteria.OrderSpecifications.byStatus(status));
        }
        if (paymentMethod != null) {
            spec = spec.and(sn.samabutik.service.criteria.OrderSpecifications.byPaymentMethod(paymentMethod));
        }
        if (paymentStatus != null) {
            spec = spec.and(sn.samabutik.service.criteria.OrderSpecifications.byPaymentStatus(paymentStatus));
        }

        Page<OrderDTO> page = orderService.findAll(spec, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Order : {}", id);
        Optional<OrderDTO> orderDTO = orderService.findOne(id);
        return ResponseUtil.wrapOrNotFound(orderDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Order : {}", id);
        orderService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/cart/active")
    public ResponseEntity<OrderDTO> getActiveCart() {
        LOG.debug("REST request to get active cart for current customer");
        String customerPhone = getCurrentCustomerPhone();
        if (customerPhone == null) {
            return ResponseEntity.noContent().build();
        }

        Optional<OrderDTO> pendingOrder = orderService.findPendingOrderByCustomer(customerPhone);
        return pendingOrder.isPresent() ? ResponseEntity.ok(pendingOrder.get()) : ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Long id) {
        LOG.debug("REST request to get items for Order : {}", id);
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }
        List<OrderItemDTO> items = orderItemService.findByOrderId(id);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<OrderItemDTO> addOrderItem(@PathVariable Long id, @Valid @RequestBody OrderItemDTO orderItemDTO) {
        LOG.debug("REST request to add item to Order : {}", id);
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }

        OrderItemDTO savedItem = orderItemService.addItemToOrder(id, orderItemDTO);
        return ResponseEntity.ok(savedItem);
    }

    @PatchMapping("/{id}/shipping")
    public ResponseEntity<OrderDTO> updateShippingInfo(@PathVariable Long id, @RequestBody ShippingUpdateDTO shippingUpdateDTO) {
        LOG.debug("REST request to update shipping for Order : {}", id);
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }
        OrderDTO updated = orderService.updateShippingInfo(id, shippingUpdateDTO.getShippingAddress(), shippingUpdateDTO.getDeliveryNote());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<OrderDTO> updatePaymentInfo(@PathVariable Long id, @RequestBody PaymentUpdateDTO paymentUpdateDTO) {
        LOG.debug("REST request to update payment for Order : {}, method: {}", id, paymentUpdateDTO.getPaymentMethod());
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }

        OrderDTO updated = orderService.updatePaymentInfo(
            id,
            paymentUpdateDTO.getPaymentMethod(),
            paymentUpdateDTO.getPhoneNumber(),
            paymentUpdateDTO.getPaymentStatus()
        );

        try {
            paymentService.initiatePayment(updated, paymentUpdateDTO.getPhoneNumber());
        } catch (Exception e) {
            LOG.error("Erreur initiation paiement pour order {}", id, e);
        }
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/finalize")
    public ResponseEntity<OrderDTO> finalizeOrder(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, String> finalizeRequest
    ) {
        LOG.debug("REST request to finalize Order : {}", id);
        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }

        PaymentStatus passedStatus = null;
        if (finalizeRequest != null && finalizeRequest.containsKey("paymentStatus")) {
            try {
                passedStatus = PaymentStatus.valueOf(finalizeRequest.get("paymentStatus"));
            } catch (IllegalArgumentException e) {
                throw new BadRequestAlertException("Invalid payment status", "order", "payment.invalid");
            }
        }

        try {
            OrderDTO finalized = orderService.finalizeOrder(id, passedStatus);
            return ResponseEntity.ok(finalized);
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "order", "payment.not.success");
        }
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<OrderTrackingDTO> getOrderTracking(@PathVariable Long id) {
        LOG.debug("REST request to get tracking for Order : {}", id);
        OrderDTO order = orderService.findOne(id).orElseThrow(() -> new BadRequestAlertException("Order not found", "order", "notfound"));

        if (!isOrderAccessibleByCurrentUser(id)) {
            return ResponseEntity.status(403).build();
        }

        OrderTrackingDTO tracking = buildTrackingInfo(order);
        return ResponseEntity.ok(tracking);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportOrdersCSV(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String paymentStatus
    ) {
        LOG.debug("REST request to export orders as CSV");
        byte[] csvData = orderService.exportToCsv(status, paymentStatus);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders_" + java.time.LocalDate.now() + ".csv")
            .header(HttpHeaders.CONTENT_TYPE, "text/csv")
            .body(csvData);
    }

    private String getCurrentCustomerPhone() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            return auth.getName();
        }
        return null;
    }

    private boolean isOrderAccessibleByCurrentUser(Long orderId) {
        if (hasRole("ROLE_ADMIN") || hasRole("ROLE_SELLER") || hasRole("ROLE_MANAGER")) {
            return true;
        }
        String customerPhone = getCurrentCustomerPhone();
        if (customerPhone == null) {
            LOG.warn("Accès refusé : Aucun utilisateur authentifié ou téléphone introuvable.");
            return false;
        }

        OrderDTO order = orderService.findOne(orderId).orElse(null);
        if (order == null) {
            return false;
        }

        if (order.getCustomer() != null && order.getCustomer().getPhone() != null) {
            boolean isOwner = order.getCustomer().getPhone().equals(customerPhone);
            if (!isOwner) {
                LOG.warn(
                    "Accès refusé : Le téléphone de l'utilisateur ({}) ne correspond pas à celui de la commande ({}).",
                    customerPhone,
                    order.getCustomer().getPhone()
                );
            }
            return isOwner;
        }
        return false;
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        LOG.info("auth = {}", auth.getAuthorities().toString());
        return (
            auth != null &&
            auth
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals(role))
        );
    }

    private OrderTrackingDTO buildTrackingInfo(OrderDTO order) {
        OrderTrackingDTO tracking = new OrderTrackingDTO();
        tracking.setStatus(order.getStatus());

        List<OrderTrackingDTO.TimelineStepDTO> timeline = new java.util.ArrayList<>();

        OrderTrackingDTO.TimelineStepDTO step1 = new OrderTrackingDTO.TimelineStepDTO();
        step1.setLabel("Commande reçue");
        step1.setStatus(OrderTrackingDTO.TimelineStepDTO.TimelineStatus.COMPLETED);
        step1.setDescription("Panier validé, paiement initié");
        timeline.add(step1);

        OrderTrackingDTO.TimelineStepDTO step2 = new OrderTrackingDTO.TimelineStepDTO();
        step2.setLabel("Paiement validé");
        step2.setStatus(
            PaymentStatus.SUCCESS.equals(order.getPaymentStatus())
                ? OrderTrackingDTO.TimelineStepDTO.TimelineStatus.COMPLETED
                : OrderTrackingDTO.TimelineStepDTO.TimelineStatus.PENDING
        );
        step2.setDescription("Transaction confirmée");
        timeline.add(step2);

        OrderTrackingDTO.TimelineStepDTO step3 = new OrderTrackingDTO.TimelineStepDTO();
        step3.setLabel("En préparation");
        if (OrderStatus.PREPARING.equals(order.getStatus())) {
            step3.setStatus(OrderTrackingDTO.TimelineStepDTO.TimelineStatus.ACTIVE);
            step3.setDescription("Nos équipes emballent vos articles");
        } else if (
            OrderStatus.PAID.equals(order.getStatus()) ||
            OrderStatus.SHIPPED.equals(order.getStatus()) ||
            OrderStatus.DELIVERED.equals(order.getStatus())
        ) {
            step3.setStatus(OrderTrackingDTO.TimelineStepDTO.TimelineStatus.COMPLETED);
            step3.setDescription("Préparation terminée");
        } else {
            step3.setStatus(OrderTrackingDTO.TimelineStepDTO.TimelineStatus.PENDING);
        }
        timeline.add(step3);

        OrderTrackingDTO.TimelineStepDTO step4 = new OrderTrackingDTO.TimelineStepDTO();
        step4.setLabel("En livraison");
        if (OrderStatus.SHIPPED.equals(order.getStatus()) || OrderStatus.DELIVERED.equals(order.getStatus())) {
            step4.setStatus(
                OrderStatus.DELIVERED.equals(order.getStatus())
                    ? OrderTrackingDTO.TimelineStepDTO.TimelineStatus.COMPLETED
                    : OrderTrackingDTO.TimelineStepDTO.TimelineStatus.ACTIVE
            );
            step4.setDescription("Livreur en route");
        } else {
            step4.setStatus(OrderTrackingDTO.TimelineStepDTO.TimelineStatus.PENDING);
        }
        timeline.add(step4);

        OrderTrackingDTO.TimelineStepDTO step5 = new OrderTrackingDTO.TimelineStepDTO();
        step5.setLabel("Livrée");
        step5.setStatus(
            OrderStatus.DELIVERED.equals(order.getStatus())
                ? OrderTrackingDTO.TimelineStepDTO.TimelineStatus.COMPLETED
                : OrderTrackingDTO.TimelineStepDTO.TimelineStatus.PENDING
        );
        step5.setDescription("À réception, vérifiez l'intégrité du colis");
        timeline.add(step5);

        tracking.setTimeline(timeline);

        if (!OrderStatus.DELIVERED.equals(order.getStatus())) {
            tracking.setEstimatedDelivery("Demain avant 18h");
        }

        if (OrderStatus.SHIPPED.equals(order.getStatus()) || OrderStatus.DELIVERED.equals(order.getStatus())) {
            OrderTrackingDTO.CourierInfoDTO courier = new OrderTrackingDTO.CourierInfoDTO();
            courier.setName("Moussa Diop");
            courier.setPhone("+221 77 XXX XX XX");
            tracking.setCourier(courier);
        }

        return tracking;
    }
}
