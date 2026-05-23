package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PackTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Pack getPackSample1() {
        return new Pack().id(1L).name("name1").description("description1");
    }

    public static Pack getPackSample2() {
        return new Pack().id(2L).name("name2").description("description2");
    }

    public static Pack getPackRandomSampleGenerator() {
        return new Pack().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString()).description(UUID.randomUUID().toString());
    }
}
