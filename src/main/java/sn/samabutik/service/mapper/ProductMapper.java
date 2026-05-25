package sn.samabutik.service.mapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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
    @Mapping(target = "gallery", source = "galleries", qualifiedByName = "mediaSetToDtoSet")
    ProductDTO toDto(Product product);

    @Mapping(target = "galleries", source = "gallery", qualifiedByName = "mediaSetFromDtoSet")
    Product toEntity(ProductDTO productDTO);

    @Named("mediaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "altText", source = "altText")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "sizeBytes", source = "sizeBytes")
    @Mapping(target = "format", source = "format")
    @Mapping(target = "width", source = "width")
    @Mapping(target = "height", source = "height")
    @Mapping(target = "durationSec", source = "durationSec")
    @Mapping(target = "displayOrder", source = "displayOrder")
    @Mapping(target = "isMain", source = "isMain")
    @Mapping(target = "uploadedAt", source = "uploadedAt")
    MediaDTO toDtoMediaId(Media media);

    // NOUVEAU: Pour charger un Product avec son mainMedia complet
    @Named("productWithMainMedia")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "sku", source = "sku")
    @Mapping(target = "mainMedia", source = "mainMedia", qualifiedByName = "mediaId")
    ProductDTO toDtoProductWithMainMedia(Product product);

    @Named("mediaSetToDtoSet")
    default Set<MediaDTO> mediaSetToDtoSet(Set<Media> medias) {
        if (medias == null) return null;
        return medias.stream().map(this::toDtoMediaId).collect(Collectors.toSet());
    }

    @Named("mediaSetFromDtoSet")
    default Set<Media> mediaSetFromDtoSet(Set<MediaDTO> mediaDTOs) {
        if (mediaDTOs == null) return null;
        return mediaDTOs
            .stream()
            .map(dto -> {
                Media media = new Media();
                media.setId(dto.getId());
                return media;
            })
            .collect(Collectors.toSet());
    }

    List<ProductDTO> toDto(List<Product> products);
}
