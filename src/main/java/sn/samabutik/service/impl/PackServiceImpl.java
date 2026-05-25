package sn.samabutik.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.Pack;
import sn.samabutik.repository.PackRepository;
import sn.samabutik.service.PackService;
import sn.samabutik.service.dto.PackDTO;
import sn.samabutik.service.mapper.PackMapper;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.Pack}.
 */
@Service
@Transactional
public class PackServiceImpl implements PackService {

    private static final Logger LOG = LoggerFactory.getLogger(PackServiceImpl.class);

    private final PackRepository packRepository;

    private final PackMapper packMapper;

    public PackServiceImpl(PackRepository packRepository, PackMapper packMapper) {
        this.packRepository = packRepository;
        this.packMapper = packMapper;
    }

    @Override
    public PackDTO save(PackDTO packDTO) {
        LOG.debug("Request to save Pack : {}", packDTO);
        Pack pack = packMapper.toEntity(packDTO);
        pack = packRepository.save(pack);
        return packMapper.toDto(pack);
    }

    @Override
    public PackDTO update(PackDTO packDTO) {
        LOG.debug("Request to update Pack : {}", packDTO);
        Pack pack = packMapper.toEntity(packDTO);
        pack = packRepository.save(pack);
        return packMapper.toDto(pack);
    }

    @Override
    public Optional<PackDTO> partialUpdate(PackDTO packDTO) {
        LOG.debug("Request to partially update Pack : {}", packDTO);

        return packRepository
            .findById(packDTO.getId())
            .map(existingPack -> {
                packMapper.partialUpdate(existingPack, packDTO);

                return existingPack;
            })
            .map(packRepository::save)
            .map(packMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PackDTO> findAll(Specification<Pack> specification, Pageable pageable) {
        LOG.debug("Request to get all Packs");
        return packRepository.findAll(specification, pageable).map(packMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PackDTO> findOne(Long id) {
        LOG.debug("Request to get Pack : {}", id);
        return packRepository
            .findByIdWithMediaAndItems(id)
            .map(pack -> {
                PackDTO dto = packMapper.toDto(pack);
                LOG.debug("Pack items count: {}", dto.getPackItems().size());
                return dto;
            });
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Pack : {}", id);
        packRepository.deleteById(id);
    }
}
