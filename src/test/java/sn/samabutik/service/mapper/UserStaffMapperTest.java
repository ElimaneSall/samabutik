package sn.samabutik.service.mapper;

import static sn.samabutik.domain.UserStaffAsserts.*;
import static sn.samabutik.domain.UserStaffTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserStaffMapperTest {

    private UserStaffMapper userStaffMapper;

    @BeforeEach
    void setUp() {
        userStaffMapper = new UserStaffMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getUserStaffSample1();
        var actual = userStaffMapper.toEntity(userStaffMapper.toDto(expected));
        assertUserStaffAllPropertiesEquals(expected, actual);
    }
}
