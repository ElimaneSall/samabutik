package sn.samabutik.service.impl;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.enumeration.OrderStatus;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;
import sn.samabutik.repository.OrderRepository;
import sn.samabutik.service.OrderService;
import sn.samabutik.service.dto.OrderDTO;
import sn.samabutik.service.mapper.OrderMapper;
import sn.samabutik.web.rest.errors.BadRequestAlertException;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.Order}.
 */
@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger LOG = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;

    private final OrderMapper orderMapper;

    public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    public OrderDTO save(OrderDTO orderDTO) {
        LOG.debug("Request to save Order : {}", orderDTO);
        Order order = orderMapper.toEntity(orderDTO);
        order = orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    @Override
    public OrderDTO update(OrderDTO orderDTO) {
        LOG.debug("Request to update Order : {}", orderDTO);
        Order order = orderMapper.toEntity(orderDTO);
        order = orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    @Override
    public Optional<OrderDTO> partialUpdate(OrderDTO orderDTO) {
        LOG.debug("Request to partially update Order : {}", orderDTO);

        return orderRepository
            .findById(orderDTO.getId())
            .map(existingOrder -> {
                orderMapper.partialUpdate(existingOrder, orderDTO);

                return existingOrder;
            })
            .map(orderRepository::save)
            .map(orderMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> findAll(Specification<Order> spec, Pageable pageable) {
        LOG.debug("Request to get all Orders by specification");
        return orderRepository.findAll(spec, pageable).map(orderMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderDTO> findOne(Long id) {
        LOG.debug("Request to get Order : {}", id);
        return orderRepository.findById(id).map(orderMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Order : {}", id);
        orderRepository.deleteById(id);
    }

    /**
     * Find pending order by customer phone (for cart functionality).
     */
    @Transactional(readOnly = true)
    public Optional<OrderDTO> findPendingOrderByCustomer(String customerPhone) {
        LOG.debug("Request to find pending order for customer : {}", customerPhone);

        return orderRepository.findByCustomerPhoneAndStatus(customerPhone, OrderStatus.PENDING).map(orderMapper::toDto);
    }

    /**
     * Update shipping information for an order.
     */
    @Transactional
    public OrderDTO updateShippingInfo(Long orderId, String shippingAddress, String deliveryNote) {
        LOG.debug("Request to update shipping info for Order : {}", orderId);

        return orderRepository
            .findById(orderId)
            .map(order -> {
                if (shippingAddress != null) {
                    order.setShippingAddress(shippingAddress);
                }
                if (deliveryNote != null) {
                    order.setDeliveryNote(deliveryNote);
                }
                Order saved = orderRepository.save(order);
                return orderMapper.toDto(saved);
            })
            .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
    }

    /**
     * Update payment information for an order.
     */
    @Transactional
    public OrderDTO updatePaymentInfo(Long orderId, PaymentMethod paymentMethod, String phoneNumber, PaymentStatus paymentStatus) {
        LOG.debug("Request to update payment info for Order : {}", orderId);

        return orderRepository
            .findById(orderId)
            .map(order -> {
                if (paymentMethod != null) {
                    order.setPaymentMethod(paymentMethod);
                }
                //            if (phoneNumber != null) {
                //                order.set(phoneNumber);
                //            }
                if (paymentStatus != null) {
                    order.setPaymentStatus(paymentStatus);
                }
                Order saved = orderRepository.save(order);
                return orderMapper.toDto(saved);
            })
            .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
    }

    /**
     * Finalize order: transition from PAID to PREPARING.
     */
    @Transactional
    public OrderDTO finalizeOrder(Long orderId, PaymentStatus newPaymentStatus) {
        LOG.debug("Request to finalize Order : {}", orderId);

        return orderRepository
            .findById(orderId)
            .map(order -> {
                // 1. If a new status was passed in, update it first
                if (newPaymentStatus != null) {
                    order.setPaymentStatus(newPaymentStatus);
                }

                // 2. Now perform the validation
                if (!PaymentStatus.SUCCESS.equals(order.getPaymentStatus())) {
                    throw new IllegalStateException("Cannot finalize order with payment status: " + order.getPaymentStatus());
                }

                // Transition: PAID → PREPARING
                order.setStatus(OrderStatus.PREPARING);
                order.setPaymentStatus(PaymentStatus.SUCCESS); // Force confirmation

                // Optionnel : décrémentation du stock des produits
                // orderItemRepository.findByOrderId(orderId).forEach(item -> {
                //     productService.decrementStock(item.getProductId(), item.getQuantity());
                // });

                Order saved = orderRepository.save(order);
                return orderMapper.toDto(saved);
            })
            .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
    }

    /**
     * Export orders to CSV format.
     */
    @Transactional(readOnly = true)
    public byte[] exportToCsv(String statusFilter, String paymentStatusFilter) {
        LOG.debug("Request to export orders to CSV");

        // Construire la requête avec filtres optionnels
        //        Specification<Order> spec = Specification.where(null);
        //        if (statusFilter != null && !statusFilter.isEmpty()) {
        //            spec = spec.and((root, query, cb) ->
        //                cb.equal(root.get("status"), OrderStatus.valueOf(statusFilter)));
        //        }
        //        if (paymentStatusFilter != null && !paymentStatusFilter.isEmpty()) {
        //            spec = spec.and((root, query, cb) ->
        //                cb.equal(root.get("paymentStatus"), PaymentStatus.valueOf(paymentStatusFilter)));
        //        }
        //
        //        List<Order> orders = orderRepository.findAll(spec);
        //
        //        // Génération CSV simple
        //        StringBuilder csv = new StringBuilder();
        //        csv.append("ID,OrderNumber,Customer,Total,Status,PaymentStatus,CreatedAt\n");
        //
        //        for (Order order : orders) {
        //            csv.append(order.getId()).append(",");
        //            csv.append(order.getOrderNumber()).append(",");
        //            csv.append(order.getCustomer() != null ? order.getCustomer().getPhone() : "").append(",");
        //            csv.append(order.getTotalAmount()).append(",");
        //            csv.append(order.getStatus()).append(",");
        //            csv.append(order.getPaymentStatus()).append(",");
        ////            csv.append(order.getCreatedDate()).append("\n");
        //        }
        //
        //        return csv.toString().getBytes(StandardCharsets.UTF_8);
        return null;
    }

    /**
     * Initiate external payment (Wave/Orange Money integration point).
     * À implémenter avec les SDK officiels des providers.
     */
    public void initiatePayment(OrderDTO order, String phoneNumber) {
        LOG.info("Initiating {} payment for order {} to phone {}", order.getPaymentMethod(), order.getId(), phoneNumber);

        // === POINT D'INTÉGRATION PAIEMENT ===
        // Exemple pseudo-code pour Wave :
        /*
        if (PaymentMethod.WAVE.equals(order.getPaymentMethod())) {
            WavePaymentRequest request = new WavePaymentRequest()
                .setAmount(order.getTotalAmount())
                .setCurrency(order.getCurrency())
                .setPhoneNumber(phoneNumber)
                .setOrderId(order.getId().toString())
                .setCallbackUrl("https://samabutik.sn/api/payment/webhook/wave");

            WavePaymentResponse response = waveClient.initiate(request);

            // Sauvegarder la référence de transaction
            order.setPaymentReference(response.getTransactionId());
            orderRepository.save(orderMapper.toEntity(order));
        }
        */

        // Pour Orange Money, logique similaire avec leur API

        // En mode démo / sans intégration réelle :
        // Le statut reste PENDING en attente de webhook ou confirmation manuelle
    }

    @Override
    public void updateOrderTotal(Long orderId, BigDecimal newTotal) {
        LOG.debug("Request to update order total for orderId: {}, newTotal: {}", orderId, newTotal);

        OrderDTO order = findOne(orderId).orElseThrow(() -> new BadRequestAlertException("Order not found", "order", "notfound"));

        order.setTotalAmount(newTotal);
        update(order);
    }
}
