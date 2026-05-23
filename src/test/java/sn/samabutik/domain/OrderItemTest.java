package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.OrderItemTestSamples.*;
import static sn.samabutik.domain.OrderTestSamples.*;
import static sn.samabutik.domain.ProductTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class OrderItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(OrderItem.class);
        OrderItem orderItem1 = getOrderItemSample1();
        OrderItem orderItem2 = new OrderItem();
        assertThat(orderItem1).isNotEqualTo(orderItem2);

        orderItem2.setId(orderItem1.getId());
        assertThat(orderItem1).isEqualTo(orderItem2);

        orderItem2 = getOrderItemSample2();
        assertThat(orderItem1).isNotEqualTo(orderItem2);
    }

    @Test
    void productSnapshotTest() {
        OrderItem orderItem = getOrderItemRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        orderItem.setProductSnapshot(productBack);
        assertThat(orderItem.getProductSnapshot()).isEqualTo(productBack);

        orderItem.productSnapshot(null);
        assertThat(orderItem.getProductSnapshot()).isNull();
    }

    @Test
    void orderTest() {
        OrderItem orderItem = getOrderItemRandomSampleGenerator();
        Order orderBack = getOrderRandomSampleGenerator();

        orderItem.setOrder(orderBack);
        assertThat(orderItem.getOrder()).isEqualTo(orderBack);

        orderItem.order(null);
        assertThat(orderItem.getOrder()).isNull();
    }
}
