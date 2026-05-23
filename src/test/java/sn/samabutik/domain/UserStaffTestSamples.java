package sn.samabutik.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UserStaffTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static UserStaff getUserStaffSample1() {
        return new UserStaff().id(1L).email("email1").phone("phone1").passwordHash("passwordHash1");
    }

    public static UserStaff getUserStaffSample2() {
        return new UserStaff().id(2L).email("email2").phone("phone2").passwordHash("passwordHash2");
    }

    public static UserStaff getUserStaffRandomSampleGenerator() {
        return new UserStaff()
            .id(longCount.incrementAndGet())
            .email(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .passwordHash(UUID.randomUUID().toString());
    }
}
