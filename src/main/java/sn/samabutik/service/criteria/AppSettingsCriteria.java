package sn.samabutik.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link sn.samabutik.domain.AppSettings} entity. This class is used
 * in {@link sn.samabutik.web.rest.AppSettingsResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /app-settings?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AppSettingsCriteria implements Serializable, Criteria {

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter paramKey;

    private StringFilter paramValue;

    private Boolean distinct;

    public AppSettingsCriteria() {}

    public AppSettingsCriteria(AppSettingsCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.paramKey = other.optionalParamKey().map(StringFilter::copy).orElse(null);
        this.paramValue = other.optionalParamValue().map(StringFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public AppSettingsCriteria copy() {
        return new AppSettingsCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getParamKey() {
        return paramKey;
    }

    public Optional<StringFilter> optionalParamKey() {
        return Optional.ofNullable(paramKey);
    }

    public StringFilter paramKey() {
        if (paramKey == null) {
            setParamKey(new StringFilter());
        }
        return paramKey;
    }

    public void setParamKey(StringFilter paramKey) {
        this.paramKey = paramKey;
    }

    public StringFilter getParamValue() {
        return paramValue;
    }

    public Optional<StringFilter> optionalParamValue() {
        return Optional.ofNullable(paramValue);
    }

    public StringFilter paramValue() {
        if (paramValue == null) {
            setParamValue(new StringFilter());
        }
        return paramValue;
    }

    public void setParamValue(StringFilter paramValue) {
        this.paramValue = paramValue;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final AppSettingsCriteria that = (AppSettingsCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(paramKey, that.paramKey) &&
            Objects.equals(paramValue, that.paramValue) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, paramKey, paramValue, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AppSettingsCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalParamKey().map(f -> "paramKey=" + f + ", ").orElse("") +
            optionalParamValue().map(f -> "paramValue=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
