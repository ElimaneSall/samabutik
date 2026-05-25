package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.PackItem;
import sn.samabutik.service.dto.PackItemDTO;

@Mapper(componentModel = "spring", uses = { ProductMapper.class })
public interface PackItemMapper extends EntityMapper<PackItemDTO, PackItem> {
    @Override
    @Mapping(target = "pack", ignore = true)
    @Mapping(target = "product", source = "product", qualifiedByName = "productWithMainMedia")
    PackItemDTO toDto(PackItem packItem);

    @Override
    @Mapping(target = "pack", ignore = true)
    @Mapping(target = "product", source = "product")
    PackItem toEntity(PackItemDTO packItemDTO);
}
