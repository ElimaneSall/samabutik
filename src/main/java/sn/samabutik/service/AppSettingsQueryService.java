package sn.samabutik.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.*; // for static metamodels
import sn.samabutik.domain.AppSettings;
import sn.samabutik.repository.AppSettingsRepository;
import sn.samabutik.service.criteria.AppSettingsCriteria;
import sn.samabutik.service.dto.AppSettingsDTO;
import sn.samabutik.service.mapper.AppSettingsMapper;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link AppSettings} entities in the database.
 * The main input is a {@link AppSettingsCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link AppSettingsDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AppSettingsQueryService extends QueryService<AppSettings> {

    private static final Logger LOG = LoggerFactory.getLogger(AppSettingsQueryService.class);

    private final AppSettingsRepository appSettingsRepository;

    private final AppSettingsMapper appSettingsMapper;

    public AppSettingsQueryService(AppSettingsRepository appSettingsRepository, AppSettingsMapper appSettingsMapper) {
        this.appSettingsRepository = appSettingsRepository;
        this.appSettingsMapper = appSettingsMapper;
    }

    /**
     * Return a {@link Page} of {@link AppSettingsDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<AppSettingsDTO> findByCriteria(AppSettingsCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<AppSettings> specification = createSpecification(criteria);
        return appSettingsRepository.findAll(specification, page).map(appSettingsMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(AppSettingsCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<AppSettings> specification = createSpecification(criteria);
        return appSettingsRepository.count(specification);
    }

    /**
     * Function to convert {@link AppSettingsCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<AppSettings> createSpecification(AppSettingsCriteria criteria) {
        Specification<AppSettings> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), AppSettings_.id),
                buildStringSpecification(criteria.getParamKey(), AppSettings_.paramKey),
                buildStringSpecification(criteria.getParamValue(), AppSettings_.paramValue)
            );
        }
        return specification;
    }
}
