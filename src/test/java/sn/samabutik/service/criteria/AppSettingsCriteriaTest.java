package sn.samabutik.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class AppSettingsCriteriaTest {

    @Test
    void newAppSettingsCriteriaHasAllFiltersNullTest() {
        var appSettingsCriteria = new AppSettingsCriteria();
        assertThat(appSettingsCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void appSettingsCriteriaFluentMethodsCreatesFiltersTest() {
        var appSettingsCriteria = new AppSettingsCriteria();

        setAllFilters(appSettingsCriteria);

        assertThat(appSettingsCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void appSettingsCriteriaCopyCreatesNullFilterTest() {
        var appSettingsCriteria = new AppSettingsCriteria();
        var copy = appSettingsCriteria.copy();

        assertThat(appSettingsCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(appSettingsCriteria)
        );
    }

    @Test
    void appSettingsCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var appSettingsCriteria = new AppSettingsCriteria();
        setAllFilters(appSettingsCriteria);

        var copy = appSettingsCriteria.copy();

        assertThat(appSettingsCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(appSettingsCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var appSettingsCriteria = new AppSettingsCriteria();

        assertThat(appSettingsCriteria).hasToString("AppSettingsCriteria{}");
    }

    private static void setAllFilters(AppSettingsCriteria appSettingsCriteria) {
        appSettingsCriteria.id();
        appSettingsCriteria.paramKey();
        appSettingsCriteria.paramValue();
        appSettingsCriteria.distinct();
    }

    private static Condition<AppSettingsCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getParamKey()) &&
                condition.apply(criteria.getParamValue()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<AppSettingsCriteria> copyFiltersAre(AppSettingsCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getParamKey(), copy.getParamKey()) &&
                condition.apply(criteria.getParamValue(), copy.getParamValue()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
