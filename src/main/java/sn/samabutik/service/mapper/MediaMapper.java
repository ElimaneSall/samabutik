package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Media;
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.dto.ProductDTO;

/**
 * Mapper for the entity {@link Media} and its DTO {@link MediaDTO}.
 */
@Mapper(componentModel = "spring")
public interface MediaMapper extends EntityMapper<MediaDTO, Media> {
    @Mapping(target = "productGallery", source = "productGallery", qualifiedByName = "productId")
    @Mapping(target = "packGallery", source = "packGallery", qualifiedByName = "packId")
    MediaDTO toDto(Media s);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);

    @Named("packId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PackDTO toDtoPackId(Pack pack);
}
