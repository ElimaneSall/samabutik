package sn.samabutik.service.mapper;

import static sn.samabutik.domain.StockMovementAsserts.*;
import static sn.samabutik.domain.StockMovementTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StockMovementMapperTest {

    private StockMovementMapper stockMovementMapper;

    @BeforeEach
    void setUp() {
        stockMovementMapper = new StockMovementMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getStockMovementSample1();
        var actual = stockMovementMapper.toEntity(stockMovementMapper.toDto(expected));
        assertStockMovementAllPropertiesEquals(expected, actual);
    }
}
