package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Media;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.ProductDTO;

/**
 * Mapper for the entity {@link Product} and its DTO {@link ProductDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper extends EntityMapper<ProductDTO, Product> {
    @Mapping(target = "mainMedia", source = "mainMedia", qualifiedByName = "mediaId")
    ProductDTO toDto(Product s);

    @Named("mediaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    MediaDTO toDtoMediaId(Media media);
}
