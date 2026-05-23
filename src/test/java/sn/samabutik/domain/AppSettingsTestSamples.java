package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AppSettingsTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static AppSettings getAppSettingsSample1() {
        return new AppSettings().id(1L).paramKey("paramKey1").paramValue("paramValue1");
    }

    public static AppSettings getAppSettingsSample2() {
        return new AppSettings().id(2L).paramKey("paramKey2").paramValue("paramValue2");
    }

    public static AppSettings getAppSettingsRandomSampleGenerator() {
        return new AppSettings()
            .id(longCount.incrementAndGet())
            .paramKey(UUID.randomUUID().toString())
            .paramValue(UUID.randomUUID().toString());
    }
}
