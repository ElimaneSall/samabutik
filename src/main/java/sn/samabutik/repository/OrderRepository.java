package sn.samabutik.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.enumeration.OrderStatus;

/**
 * Spring Data JPA repository for the Order entity.
 */
@SuppressWarnings("unused")
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    /**
     * Find pending order by customer phone.
     */
    Optional<Order> findByCustomerPhoneAndStatus(String customerPhone, OrderStatus status);

    /**
     * Find all orders for a customer (for order history).
     */
    List<Order> findByCustomerPhoneOrderByIdDesc(String phone);
}
