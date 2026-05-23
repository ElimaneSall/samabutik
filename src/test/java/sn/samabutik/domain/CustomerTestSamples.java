package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CustomerTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Customer getCustomerSample1() {
        return new Customer()
            .id(1L)
            .phone("phone1")
            .firstName("firstName1")
            .lastName("lastName1")
            .email("email1")
            .description("description1")
            .city("city1");
    }

    public static Customer getCustomerSample2() {
        return new Customer()
            .id(2L)
            .phone("phone2")
            .firstName("firstName2")
            .lastName("lastName2")
            .email("email2")
            .description("description2")
            .city("city2");
    }

    public static Customer getCustomerRandomSampleGenerator() {
        return new Customer()
            .id(longCount.incrementAndGet())
            .phone(UUID.randomUUID().toString())
            .firstName(UUID.randomUUID().toString())
            .lastName(UUID.randomUUID().toString())
            .email(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString());
    }
}
