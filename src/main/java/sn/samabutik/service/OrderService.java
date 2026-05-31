package sn.samabutik.service;

import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;
import sn.samabutik.service.dto.OrderDTO;

/**
 * Service Interface for managing {@link sn.samabutik.domain.Order}.
 */
public interface OrderService {
    /**
     * Save a order.
     *
     * @param orderDTO the entity to save.
     * @return the persisted entity.
     */
    OrderDTO save(OrderDTO orderDTO);

    /**
     * Updates a order.
     *
     * @param orderDTO the entity to update.
     * @return the persisted entity.
     */
    OrderDTO update(OrderDTO orderDTO);

    /**
     * Partially updates a order.
     *
     * @param orderDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<OrderDTO> partialUpdate(OrderDTO orderDTO);

    /**
     * Get all the orders.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<OrderDTO> findAll(Specification<Order> spec, Pageable pageable);
    /**
     * Get the "id" order.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<OrderDTO> findOne(Long id);

    /**
     * Delete the "id" order.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    Optional<OrderDTO> findPendingOrderByCustomer(String customerPhone);

    OrderDTO updateShippingInfo(Long orderId, String shippingAddress, String deliveryNote);

    OrderDTO updatePaymentInfo(Long orderId, PaymentMethod paymentMethod, String phoneNumber, PaymentStatus paymentStatus);

    OrderDTO finalizeOrder(Long orderId, PaymentStatus paymentStatus);

    byte[] exportToCsv(String statusFilter, String paymentStatusFilter);
    void initiatePayment(OrderDTO order, String phoneNumber);

    void updateOrderTotal(Long orderId, BigDecimal newTotal);
}
