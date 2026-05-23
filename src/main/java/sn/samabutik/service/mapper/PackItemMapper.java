package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.PackItem;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.dto.PackItemDTO;
import sn.samabutik.service.dto.ProductDTO;

/**
 * Mapper for the entity {@link PackItem} and its DTO {@link PackItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface PackItemMapper extends EntityMapper<PackItemDTO, PackItem> {
    @Mapping(target = "pack", source = "pack", qualifiedByName = "packId")
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    PackItemDTO toDto(PackItem s);

    @Named("packId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PackDTO toDtoPackId(Pack pack);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);
}
