package sn.samabutik.service.mapper;

import static sn.samabutik.domain.PackItemAsserts.*;
import static sn.samabutik.domain.PackItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PackItemMapperTest {

    private PackItemMapper packItemMapper;

    @BeforeEach
    void setUp() {
        packItemMapper = new PackItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPackItemSample1();
        var actual = packItemMapper.toEntity(packItemMapper.toDto(expected));
        assertPackItemAllPropertiesEquals(expected, actual);
    }
}
