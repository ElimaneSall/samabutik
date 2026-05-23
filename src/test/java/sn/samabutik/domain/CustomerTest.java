package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.CustomerTestSamples.*;
import static sn.samabutik.domain.OrderTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class CustomerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Customer.class);
        Customer customer1 = getCustomerSample1();
        Customer customer2 = new Customer();
        assertThat(customer1).isNotEqualTo(customer2);

        customer2.setId(customer1.getId());
        assertThat(customer1).isEqualTo(customer2);

        customer2 = getCustomerSample2();
        assertThat(customer1).isNotEqualTo(customer2);
    }

    @Test
    void ordersTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        Order orderBack = getOrderRandomSampleGenerator();

        customer.addOrders(orderBack);
        assertThat(customer.getOrderses()).containsOnly(orderBack);
        assertThat(orderBack.getCustomer()).isEqualTo(customer);

        customer.removeOrders(orderBack);
        assertThat(customer.getOrderses()).doesNotContain(orderBack);
        assertThat(orderBack.getCustomer()).isNull();

        customer.orderses(new HashSet<>(Set.of(orderBack)));
        assertThat(customer.getOrderses()).containsOnly(orderBack);
        assertThat(orderBack.getCustomer()).isEqualTo(customer);

        customer.setOrderses(new HashSet<>());
        assertThat(customer.getOrderses()).doesNotContain(orderBack);
        assertThat(orderBack.getCustomer()).isNull();
    }
}
