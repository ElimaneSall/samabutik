package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class MediaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Media getMediaSample1() {
        return new Media().id(1L).url("url1").sizeBytes(1).width(1).height(1).durationSec(1).displayOrder(1).altText("altText1");
    }

    public static Media getMediaSample2() {
        return new Media().id(2L).url("url2").sizeBytes(2).width(2).height(2).durationSec(2).displayOrder(2).altText("altText2");
    }

    public static Media getMediaRandomSampleGenerator() {
        return new Media()
            .id(longCount.incrementAndGet())
            .url(UUID.randomUUID().toString())
            .sizeBytes(intCount.incrementAndGet())
            .width(intCount.incrementAndGet())
            .height(intCount.incrementAndGet())
            .durationSec(intCount.incrementAndGet())
            .displayOrder(intCount.incrementAndGet())
            .altText(UUID.randomUUID().toString());
    }
}
