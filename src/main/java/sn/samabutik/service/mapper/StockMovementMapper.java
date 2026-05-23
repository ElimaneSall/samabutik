package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Product;
import sn.samabutik.domain.StockMovement;
import sn.samabutik.domain.UserStaff;
import sn.samabutik.service.dto.ProductDTO;
import sn.samabutik.service.dto.StockMovementDTO;
import sn.samabutik.service.dto.UserStaffDTO;

/**
 * Mapper for the entity {@link StockMovement} and its DTO {@link StockMovementDTO}.
 */
@Mapper(componentModel = "spring")
public interface StockMovementMapper extends EntityMapper<StockMovementDTO, StockMovement> {
    @Mapping(target = "performedBy", source = "performedBy", qualifiedByName = "userStaffId")
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    StockMovementDTO toDto(StockMovement s);

    @Named("userStaffId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserStaffDTO toDtoUserStaffId(UserStaff userStaff);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);
}
