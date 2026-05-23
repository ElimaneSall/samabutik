package sn.samabutik.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.AppSettings;
import sn.samabutik.repository.AppSettingsRepository;
import sn.samabutik.service.AppSettingsService;
import sn.samabutik.service.dto.AppSettingsDTO;
import sn.samabutik.service.mapper.AppSettingsMapper;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.AppSettings}.
 */
@Service
@Transactional
public class AppSettingsServiceImpl implements AppSettingsService {

    private static final Logger LOG = LoggerFactory.getLogger(AppSettingsServiceImpl.class);

    private final AppSettingsRepository appSettingsRepository;

    private final AppSettingsMapper appSettingsMapper;

    public AppSettingsServiceImpl(AppSettingsRepository appSettingsRepository, AppSettingsMapper appSettingsMapper) {
        this.appSettingsRepository = appSettingsRepository;
        this.appSettingsMapper = appSettingsMapper;
    }

    @Override
    public AppSettingsDTO save(AppSettingsDTO appSettingsDTO) {
        LOG.debug("Request to save AppSettings : {}", appSettingsDTO);
        AppSettings appSettings = appSettingsMapper.toEntity(appSettingsDTO);
        appSettings = appSettingsRepository.save(appSettings);
        return appSettingsMapper.toDto(appSettings);
    }

    @Override
    public AppSettingsDTO update(AppSettingsDTO appSettingsDTO) {
        LOG.debug("Request to update AppSettings : {}", appSettingsDTO);
        AppSettings appSettings = appSettingsMapper.toEntity(appSettingsDTO);
        appSettings = appSettingsRepository.save(appSettings);
        return appSettingsMapper.toDto(appSettings);
    }

    @Override
    public Optional<AppSettingsDTO> partialUpdate(AppSettingsDTO appSettingsDTO) {
        LOG.debug("Request to partially update AppSettings : {}", appSettingsDTO);

        return appSettingsRepository
            .findById(appSettingsDTO.getId())
            .map(existingAppSettings -> {
                appSettingsMapper.partialUpdate(existingAppSettings, appSettingsDTO);

                return existingAppSettings;
            })
            .map(appSettingsRepository::save)
            .map(appSettingsMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AppSettingsDTO> findOne(Long id) {
        LOG.debug("Request to get AppSettings : {}", id);
        return appSettingsRepository.findById(id).map(appSettingsMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete AppSettings : {}", id);
        appSettingsRepository.deleteById(id);
    }
}
