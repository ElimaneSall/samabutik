package sn.samabutik.service.mapper;

import static sn.samabutik.domain.AppSettingsAsserts.*;
import static sn.samabutik.domain.AppSettingsTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AppSettingsMapperTest {

    private AppSettingsMapper appSettingsMapper;

    @BeforeEach
    void setUp() {
        appSettingsMapper = new AppSettingsMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAppSettingsSample1();
        var actual = appSettingsMapper.toEntity(appSettingsMapper.toDto(expected));
        assertAppSettingsAllPropertiesEquals(expected, actual);
    }
}
