package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.Media;
import sn.samabutik.domain.Pack;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.dto.PackDTO;

/**
 * Mapper for the entity {@link Pack} and its DTO {@link PackDTO}.
 */
@Mapper(componentModel = "spring")
public interface PackMapper extends EntityMapper<PackDTO, Pack> {
    @Mapping(target = "mainMedia", source = "mainMedia", qualifiedByName = "mediaId")
    PackDTO toDto(Pack s);

    @Named("mediaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    MediaDTO toDtoMediaId(Media media);
}
