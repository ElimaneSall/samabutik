package sn.samabutik.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.OrderItem;
import sn.samabutik.repository.OrderItemRepository;
import sn.samabutik.service.OrderItemService;
import sn.samabutik.service.OrderService;
import sn.samabutik.service.dto.OrderDTO;
import sn.samabutik.service.dto.OrderItemDTO;
import sn.samabutik.service.mapper.OrderItemMapper;
import sn.samabutik.web.rest.errors.BadRequestAlertException;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.OrderItem}.
 */
@Service
@Transactional
public class OrderItemServiceImpl implements OrderItemService {

    private static final Logger LOG = LoggerFactory.getLogger(OrderItemServiceImpl.class);

    private final OrderItemRepository orderItemRepository;

    private final OrderItemMapper orderItemMapper;

    private final OrderService orderService;

    public OrderItemServiceImpl(OrderItemRepository orderItemRepository, OrderItemMapper orderItemMapper, OrderService orderService) {
        this.orderItemRepository = orderItemRepository;
        this.orderItemMapper = orderItemMapper;
        this.orderService = orderService;
    }

    @Override
    public OrderItemDTO save(OrderItemDTO orderItemDTO) {
        LOG.debug("Request to save OrderItem : {}", orderItemDTO);
        OrderItem orderItem = orderItemMapper.toEntity(orderItemDTO);
        orderItem = orderItemRepository.save(orderItem);
        return orderItemMapper.toDto(orderItem);
    }

    @Override
    public OrderItemDTO update(OrderItemDTO orderItemDTO) {
        LOG.debug("Request to update OrderItem : {}", orderItemDTO);
        OrderItem orderItem = orderItemMapper.toEntity(orderItemDTO);
        orderItem = orderItemRepository.save(orderItem);
        return orderItemMapper.toDto(orderItem);
    }

    @Override
    public Optional<OrderItemDTO> partialUpdate(OrderItemDTO orderItemDTO) {
        LOG.debug("Request to partially update OrderItem : {}", orderItemDTO);

        return orderItemRepository
            .findById(orderItemDTO.getId())
            .map(existingOrderItem -> {
                orderItemMapper.partialUpdate(existingOrderItem, orderItemDTO);

                return existingOrderItem;
            })
            .map(orderItemRepository::save)
            .map(orderItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderItemDTO> findAll(Specification<OrderItem> spec, Pageable pageable) {
        LOG.debug("Request to get all OrderItems by specification");
        Page<OrderItem> page = orderItemRepository.findAll(spec, pageable);
        return page.map(orderItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderItemDTO> findOne(Long id) {
        LOG.debug("Request to get OrderItem : {}", id);
        return orderItemRepository.findById(id).map(orderItemMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete OrderItem : {}", id);
        orderItemRepository.deleteById(id);
    }

    @Override
    public List<OrderItemDTO> findByOrderId(Long id) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        return orderItemMapper.toDto(orderItems);
    }

    @Override
    public OrderItemDTO addItemToOrder(Long orderId, OrderItemDTO orderItemDTO) {
        LOG.debug("Request to add item to Order : {}", orderId);

        OrderDTO order = orderService
            .findOne(orderId)
            .orElseThrow(() -> new BadRequestAlertException("Order not found", "order", "notfound"));

        orderItemDTO.setOrder(order);
        orderItemDTO.setId(null);

        OrderItemDTO saved = save(orderItemDTO);

        BigDecimal newTotal = calculateOrderTotal(orderId);
        orderService.updateOrderTotal(orderId, newTotal);

        return saved;
    }

    private BigDecimal calculateOrderTotal(Long orderId) {
        List<OrderItemDTO> items = findByOrderId(orderId);
        return items.stream().map(OrderItemDTO::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
