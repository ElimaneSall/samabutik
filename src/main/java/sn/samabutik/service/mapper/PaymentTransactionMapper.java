package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.PaymentTransaction;
import sn.samabutik.service.dto.OrderDTO;
import sn.samabutik.service.dto.PaymentTransactionDTO;

/**
 * Mapper for the entity {@link PaymentTransaction} and its DTO {@link PaymentTransactionDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaymentTransactionMapper extends EntityMapper<PaymentTransactionDTO, PaymentTransaction> {
    @Mapping(target = "order", source = "order", qualifiedByName = "orderId")
    PaymentTransactionDTO toDto(PaymentTransaction s);

    @Named("orderId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    OrderDTO toDtoOrderId(Order order);
}
