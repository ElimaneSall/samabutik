package sn.samabutik.service.mapper;

import java.util.HashSet;
import java.util.Set;
import org.mapstruct.*;
import sn.samabutik.domain.Pack;
import sn.samabutik.domain.PackItem;
import sn.samabutik.domain.Product;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.dto.PackItemDTO;
import sn.samabutik.service.dto.ProductDTO;

@Mapper(componentModel = "spring", uses = { MediaMapper.class, ProductMapper.class })
public interface PackMapper extends EntityMapper<PackDTO, Pack> {
    @Override
    @Mapping(target = "mainMedia", source = "mainMedia")
    @Mapping(target = "galleries", source = "galleries")
    @Mapping(target = "packItems", source = "packItems", qualifiedByName = "mapPackItems")
    PackDTO toDto(Pack pack);

    @Override
    @Mapping(target = "mainMedia", ignore = true)
    @Mapping(target = "galleries", ignore = true)
    @Mapping(target = "packItems", ignore = true)
    Pack toEntity(PackDTO packDTO);

    @Named("mapPackItems")
    default Set<PackItemDTO> mapPackItems(Set<PackItem> packItems) {
        if (packItems == null) {
            return new HashSet<>();
        }

        Set<PackItemDTO> result = new HashSet<>();
        for (PackItem packItem : packItems) {
            PackItemDTO dto = new PackItemDTO();
            dto.setId(packItem.getId());
            dto.setQuantity(packItem.getQuantity());

            // Map product only, NOT pack (to avoid cycle)
            if (packItem.getProduct() != null) {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(packItem.getProduct().getId());
                productDTO.setName(packItem.getProduct().getName());
                productDTO.setSku(packItem.getProduct().getSku());
                productDTO.setPrice(packItem.getProduct().getPrice());
                // Map other needed fields
                dto.setProduct(productDTO);
            }

            // IMPORTANT: Ne pas setter le pack ici
            // dto.setPack(null); // déjà null par défaut

            result.add(dto);
        }
        return result;
    }

    @Named("productBasicInfo")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "sku", source = "sku")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "mainMedia", source = "mainMedia", qualifiedByName = "mediaId")
    ProductDTO toDtoProductBasicInfo(Product product);
}
