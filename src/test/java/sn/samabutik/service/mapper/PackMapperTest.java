package sn.samabutik.service.mapper;

import static sn.samabutik.domain.PackAsserts.*;
import static sn.samabutik.domain.PackTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PackMapperTest {

    private PackMapper packMapper;

    @BeforeEach
    void setUp() {
        packMapper = new PackMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPackSample1();
        var actual = packMapper.toEntity(packMapper.toDto(expected));
        assertPackAllPropertiesEquals(expected, actual);
    }
}
