package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Customer;
import sn.samabutik.domain.Order;
import sn.samabutik.service.dto.CustomerDTO;
import sn.samabutik.service.dto.OrderDTO;

/**
 * Mapper for the entity {@link Order} and its DTO {@link OrderDTO}.
 */
@Mapper(componentModel = "spring")
public interface OrderMapper extends EntityMapper<OrderDTO, Order> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    OrderDTO toDto(Order s);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);
}
