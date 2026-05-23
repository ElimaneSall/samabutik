package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class OrderTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Order getOrderSample1() {
        return new Order()
            .id(1L)
            .orderNumber("orderNumber1")
            .currency("currency1")
            .paymentReference("paymentReference1")
            .shippingAddress("shippingAddress1")
            .deliveryNote("deliveryNote1");
    }

    public static Order getOrderSample2() {
        return new Order()
            .id(2L)
            .orderNumber("orderNumber2")
            .currency("currency2")
            .paymentReference("paymentReference2")
            .shippingAddress("shippingAddress2")
            .deliveryNote("deliveryNote2");
    }

    public static Order getOrderRandomSampleGenerator() {
        return new Order()
            .id(longCount.incrementAndGet())
            .orderNumber(UUID.randomUUID().toString())
            .currency(UUID.randomUUID().toString())
            .paymentReference(UUID.randomUUID().toString())
            .shippingAddress(UUID.randomUUID().toString())
            .deliveryNote(UUID.randomUUID().toString());
    }
}
