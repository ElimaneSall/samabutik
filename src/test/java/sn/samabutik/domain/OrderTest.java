package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.CustomerTestSamples.*;
import static sn.samabutik.domain.OrderItemTestSamples.*;
import static sn.samabutik.domain.OrderTestSamples.*;
import static sn.samabutik.domain.PaymentTransactionTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class OrderTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Order.class);
        Order order1 = getOrderSample1();
        Order order2 = new Order();
        assertThat(order1).isNotEqualTo(order2);

        order2.setId(order1.getId());
        assertThat(order1).isEqualTo(order2);

        order2 = getOrderSample2();
        assertThat(order1).isNotEqualTo(order2);
    }

    @Test
    void orderItemsTest() {
        Order order = getOrderRandomSampleGenerator();
        OrderItem orderItemBack = getOrderItemRandomSampleGenerator();

        order.addOrderItems(orderItemBack);
        assertThat(order.getOrderItemses()).containsOnly(orderItemBack);
        assertThat(orderItemBack.getOrder()).isEqualTo(order);

        order.removeOrderItems(orderItemBack);
        assertThat(order.getOrderItemses()).doesNotContain(orderItemBack);
        assertThat(orderItemBack.getOrder()).isNull();

        order.orderItemses(new HashSet<>(Set.of(orderItemBack)));
        assertThat(order.getOrderItemses()).containsOnly(orderItemBack);
        assertThat(orderItemBack.getOrder()).isEqualTo(order);

        order.setOrderItemses(new HashSet<>());
        assertThat(order.getOrderItemses()).doesNotContain(orderItemBack);
        assertThat(orderItemBack.getOrder()).isNull();
    }

    @Test
    void transactionsTest() {
        Order order = getOrderRandomSampleGenerator();
        PaymentTransaction paymentTransactionBack = getPaymentTransactionRandomSampleGenerator();

        order.addTransactions(paymentTransactionBack);
        assertThat(order.getTransactionses()).containsOnly(paymentTransactionBack);
        assertThat(paymentTransactionBack.getOrder()).isEqualTo(order);

        order.removeTransactions(paymentTransactionBack);
        assertThat(order.getTransactionses()).doesNotContain(paymentTransactionBack);
        assertThat(paymentTransactionBack.getOrder()).isNull();

        order.transactionses(new HashSet<>(Set.of(paymentTransactionBack)));
        assertThat(order.getTransactionses()).containsOnly(paymentTransactionBack);
        assertThat(paymentTransactionBack.getOrder()).isEqualTo(order);

        order.setTransactionses(new HashSet<>());
        assertThat(order.getTransactionses()).doesNotContain(paymentTransactionBack);
        assertThat(paymentTransactionBack.getOrder()).isNull();
    }

    @Test
    void customerTest() {
        Order order = getOrderRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        order.setCustomer(customerBack);
        assertThat(order.getCustomer()).isEqualTo(customerBack);

        order.customer(null);
        assertThat(order.getCustomer()).isNull();
    }
}
