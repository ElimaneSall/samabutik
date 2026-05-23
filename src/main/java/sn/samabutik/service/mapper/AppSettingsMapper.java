package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.AppSettings;
import sn.samabutik.service.dto.AppSettingsDTO;

/**
 * Mapper for the entity {@link AppSettings} and its DTO {@link AppSettingsDTO}.
 */
@Mapper(componentModel = "spring")
public interface AppSettingsMapper extends EntityMapper<AppSettingsDTO, AppSettings> {}
