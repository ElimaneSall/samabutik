package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.OrderTestSamples.*;
import static sn.samabutik.domain.PaymentTransactionTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class PaymentTransactionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PaymentTransaction.class);
        PaymentTransaction paymentTransaction1 = getPaymentTransactionSample1();
        PaymentTransaction paymentTransaction2 = new PaymentTransaction();
        assertThat(paymentTransaction1).isNotEqualTo(paymentTransaction2);

        paymentTransaction2.setId(paymentTransaction1.getId());
        assertThat(paymentTransaction1).isEqualTo(paymentTransaction2);

        paymentTransaction2 = getPaymentTransactionSample2();
        assertThat(paymentTransaction1).isNotEqualTo(paymentTransaction2);
    }

    @Test
    void orderTest() {
        PaymentTransaction paymentTransaction = getPaymentTransactionRandomSampleGenerator();
        Order orderBack = getOrderRandomSampleGenerator();

        paymentTransaction.setOrder(orderBack);
        assertThat(paymentTransaction.getOrder()).isEqualTo(orderBack);

        paymentTransaction.order(null);
        assertThat(paymentTransaction.getOrder()).isNull();
    }
}
