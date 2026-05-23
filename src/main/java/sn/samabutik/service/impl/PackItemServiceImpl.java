package sn.samabutik.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.PackItem;
import sn.samabutik.repository.PackItemRepository;
import sn.samabutik.service.PackItemService;
import sn.samabutik.service.dto.PackItemDTO;
import sn.samabutik.service.mapper.PackItemMapper;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.PackItem}.
 */
@Service
@Transactional
public class PackItemServiceImpl implements PackItemService {

    private static final Logger LOG = LoggerFactory.getLogger(PackItemServiceImpl.class);

    private final PackItemRepository packItemRepository;

    private final PackItemMapper packItemMapper;

    public PackItemServiceImpl(PackItemRepository packItemRepository, PackItemMapper packItemMapper) {
        this.packItemRepository = packItemRepository;
        this.packItemMapper = packItemMapper;
    }

    @Override
    public PackItemDTO save(PackItemDTO packItemDTO) {
        LOG.debug("Request to save PackItem : {}", packItemDTO);
        PackItem packItem = packItemMapper.toEntity(packItemDTO);
        packItem = packItemRepository.save(packItem);
        return packItemMapper.toDto(packItem);
    }

    @Override
    public PackItemDTO update(PackItemDTO packItemDTO) {
        LOG.debug("Request to update PackItem : {}", packItemDTO);
        PackItem packItem = packItemMapper.toEntity(packItemDTO);
        packItem = packItemRepository.save(packItem);
        return packItemMapper.toDto(packItem);
    }

    @Override
    public Optional<PackItemDTO> partialUpdate(PackItemDTO packItemDTO) {
        LOG.debug("Request to partially update PackItem : {}", packItemDTO);

        return packItemRepository
            .findById(packItemDTO.getId())
            .map(existingPackItem -> {
                packItemMapper.partialUpdate(existingPackItem, packItemDTO);

                return existingPackItem;
            })
            .map(packItemRepository::save)
            .map(packItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PackItemDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all PackItems");
        return packItemRepository.findAll(pageable).map(packItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PackItemDTO> findOne(Long id) {
        LOG.debug("Request to get PackItem : {}", id);
        return packItemRepository.findById(id).map(packItemMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete PackItem : {}", id);
        packItemRepository.deleteById(id);
    }
}
