package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Customer;
import sn.samabutik.service.dto.CustomerDTO;

/**
 * Mapper for the entity {@link Customer} and its DTO {@link CustomerDTO}.
 */
@Mapper(componentModel = "spring")
public interface CustomerMapper extends EntityMapper<CustomerDTO, Customer> {}
