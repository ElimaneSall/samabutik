package sn.samabutik.service.mapper;

import static sn.samabutik.domain.MediaAsserts.*;
import static sn.samabutik.domain.MediaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MediaMapperTest {

    private MediaMapper mediaMapper;

    @BeforeEach
    void setUp() {
        mediaMapper = new MediaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getMediaSample1();
        var actual = mediaMapper.toEntity(mediaMapper.toDto(expected));
        assertMediaAllPropertiesEquals(expected, actual);
    }
}
