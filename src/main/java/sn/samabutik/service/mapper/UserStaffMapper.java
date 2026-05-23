package sn.samabutik.service.mapper;

import org.mapstruct.*;
import sn.samabutik.domain.UserStaff;
import sn.samabutik.service.dto.UserStaffDTO;

/**
 * Mapper for the entity {@link UserStaff} and its DTO {@link UserStaffDTO}.
 */
@Mapper(componentModel = "spring")
public interface UserStaffMapper extends EntityMapper<UserStaffDTO, UserStaff> {}
