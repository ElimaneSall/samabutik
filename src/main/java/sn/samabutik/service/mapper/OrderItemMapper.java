package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.OrderItem;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.OrderDTO;
import sn.samabutik.service.dto.OrderItemDTO;
import sn.samabutik.service.dto.ProductDTO;

/**
 * Mapper for the entity {@link OrderItem} and its DTO {@link OrderItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface OrderItemMapper extends EntityMapper<OrderItemDTO, OrderItem> {
    @Mapping(target = "productSnapshot", source = "productSnapshot", qualifiedByName = "productId")
    @Mapping(target = "order", source = "order", qualifiedByName = "orderId")
    OrderItemDTO toDto(OrderItem s);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);

    @Named("orderId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    OrderDTO toDtoOrderId(Order order);
}
