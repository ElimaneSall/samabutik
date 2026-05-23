package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.StockMovementTestSamples.*;
import static sn.samabutik.domain.UserStaffTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class UserStaffTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserStaff.class);
        UserStaff userStaff1 = getUserStaffSample1();
        UserStaff userStaff2 = new UserStaff();
        assertThat(userStaff1).isNotEqualTo(userStaff2);

        userStaff2.setId(userStaff1.getId());
        assertThat(userStaff1).isEqualTo(userStaff2);

        userStaff2 = getUserStaffSample2();
        assertThat(userStaff1).isNotEqualTo(userStaff2);
    }

    @Test
    void stockMovementTest() {
        UserStaff userStaff = getUserStaffRandomSampleGenerator();
        StockMovement stockMovementBack = getStockMovementRandomSampleGenerator();

        userStaff.setStockMovement(stockMovementBack);
        assertThat(userStaff.getStockMovement()).isEqualTo(stockMovementBack);
        assertThat(stockMovementBack.getPerformedBy()).isEqualTo(userStaff);

        userStaff.stockMovement(null);
        assertThat(userStaff.getStockMovement()).isNull();
        assertThat(stockMovementBack.getPerformedBy()).isNull();
    }
}
