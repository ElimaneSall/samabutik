package sn.samabutik.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PackItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static PackItem getPackItemSample1() {
        return new PackItem().id(1L).quantity(1);
    }

    public static PackItem getPackItemSample2() {
        return new PackItem().id(2L).quantity(2);
    }

    public static PackItem getPackItemRandomSampleGenerator() {
        return new PackItem().id(longCount.incrementAndGet()).quantity(intCount.incrementAndGet());
    }
}
