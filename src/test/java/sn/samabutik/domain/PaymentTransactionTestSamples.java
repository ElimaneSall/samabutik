package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PaymentTransactionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static PaymentTransaction getPaymentTransactionSample1() {
        return new PaymentTransaction().id(1L).transactionId("transactionId1").currency("currency1").webhookPayload("webhookPayload1");
    }

    public static PaymentTransaction getPaymentTransactionSample2() {
        return new PaymentTransaction().id(2L).transactionId("transactionId2").currency("currency2").webhookPayload("webhookPayload2");
    }

    public static PaymentTransaction getPaymentTransactionRandomSampleGenerator() {
        return new PaymentTransaction()
            .id(longCount.incrementAndGet())
            .transactionId(UUID.randomUUID().toString())
            .currency(UUID.randomUUID().toString())
            .webhookPayload(UUID.randomUUID().toString());
    }
}
