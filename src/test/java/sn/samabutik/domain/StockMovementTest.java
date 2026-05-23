package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.ProductTestSamples.*;
import static sn.samabutik.domain.StockMovementTestSamples.*;
import static sn.samabutik.domain.UserStaffTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class StockMovementTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(StockMovement.class);
        StockMovement stockMovement1 = getStockMovementSample1();
        StockMovement stockMovement2 = new StockMovement();
        assertThat(stockMovement1).isNotEqualTo(stockMovement2);

        stockMovement2.setId(stockMovement1.getId());
        assertThat(stockMovement1).isEqualTo(stockMovement2);

        stockMovement2 = getStockMovementSample2();
        assertThat(stockMovement1).isNotEqualTo(stockMovement2);
    }

    @Test
    void performedByTest() {
        StockMovement stockMovement = getStockMovementRandomSampleGenerator();
        UserStaff userStaffBack = getUserStaffRandomSampleGenerator();

        stockMovement.setPerformedBy(userStaffBack);
        assertThat(stockMovement.getPerformedBy()).isEqualTo(userStaffBack);

        stockMovement.performedBy(null);
        assertThat(stockMovement.getPerformedBy()).isNull();
    }

    @Test
    void productTest() {
        StockMovement stockMovement = getStockMovementRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        stockMovement.setProduct(productBack);
        assertThat(stockMovement.getProduct()).isEqualTo(productBack);

        stockMovement.product(null);
        assertThat(stockMovement.getProduct()).isNull();
    }
}
