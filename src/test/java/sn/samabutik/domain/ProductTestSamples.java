package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ProductTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Product getProductSample1() {
        return new Product()
            .id(1L)
            .sku("sku1")
            .name("name1")
            .description("description1")
            .currency("currency1")
            .stock(1)
            .lowStockThreshold(1)
            .category("category1");
    }

    public static Product getProductSample2() {
        return new Product()
            .id(2L)
            .sku("sku2")
            .name("name2")
            .description("description2")
            .currency("currency2")
            .stock(2)
            .lowStockThreshold(2)
            .category("category2");
    }

    public static Product getProductRandomSampleGenerator() {
        return new Product()
            .id(longCount.incrementAndGet())
            .sku(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .currency(UUID.randomUUID().toString())
            .stock(intCount.incrementAndGet())
            .lowStockThreshold(intCount.incrementAndGet())
            .category(UUID.randomUUID().toString());
    }
}
