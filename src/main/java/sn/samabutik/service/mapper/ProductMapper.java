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
    // ─── Mapping principal ─────────────────────────────────────────────
    @Mapping(target = "mainMedia", source = "mainMedia", qualifiedByName = "mediaId")
    @Mapping(target = "gallery", source = "galleries", qualifiedByName = "mediaSetToDtoSet")
    ProductDTO toDto(Product product);

    @Mapping(target = "galleries", source = "gallery", qualifiedByName = "mediaSetFromDtoSet")
    Product toEntity(ProductDTO productDTO);

    // ─── Mapping pour mainMedia (déjà existant) ────────────────────────
    @Named("mediaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "url", source = "url")
    MediaDTO toDtoMediaId(Media media);

    // ─── NOUVEAU: Mapping pour Set<Media> → Set<MediaDTO> ─────────────
    @Named("mediaSetToDtoSet")
    default Set<MediaDTO> mediaSetToDtoSet(Set<Media> medias) {
        if (medias == null) return null;
        return medias
            .stream()
            .map(this::toDtoMediaId) // Réutilise la méthode mediaId
            .collect(Collectors.toSet());
    }

    // ─── NOUVEAU: Mapping inverse Set<MediaDTO> → Set<Media> ──────────
    @Named("mediaSetFromDtoSet")
    default Set<Media> mediaSetFromDtoSet(Set<MediaDTO> mediaDTOs) {
        if (mediaDTOs == null) return null;
        return mediaDTOs
            .stream()
            .map(dto -> {
                Media media = new Media();
                media.setId(dto.getId());
                // On ne mappe que l'ID pour les relations existantes
                return media;
            })
            .collect(Collectors.toSet());
    }

    // ─── Autres méthodes existantes ───────────────────────────────────
    List<ProductDTO> toDto(List<Product> products);
}
