package sn.samabutik.service.impl;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.samabutik.domain.Media;
import sn.samabutik.repository.MediaRepository;
import sn.samabutik.service.MediaService;
import sn.samabutik.service.dto.MediaDTO;
import sn.samabutik.service.mapper.MediaMapper;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.Media}.
 */
@Service
@Transactional
public class MediaServiceImpl implements MediaService {

    private static final Logger LOG = LoggerFactory.getLogger(MediaServiceImpl.class);

    private final MediaRepository mediaRepository;

    private final MediaMapper mediaMapper;

    public MediaServiceImpl(MediaRepository mediaRepository, MediaMapper mediaMapper) {
        this.mediaRepository = mediaRepository;
        this.mediaMapper = mediaMapper;
    }

    @Override
    public MediaDTO save(MediaDTO mediaDTO) {
        LOG.debug("Request to save Media : {}", mediaDTO);
        Media media = mediaMapper.toEntity(mediaDTO);
        media = mediaRepository.save(media);
        return mediaMapper.toDto(media);
    }

    @Override
    public MediaDTO update(MediaDTO mediaDTO) {
        LOG.debug("Request to update Media : {}", mediaDTO);
        Media media = mediaMapper.toEntity(mediaDTO);
        media = mediaRepository.save(media);
        return mediaMapper.toDto(media);
    }

    @Override
    public Optional<MediaDTO> partialUpdate(MediaDTO mediaDTO) {
        LOG.debug("Request to partially update Media : {}", mediaDTO);

        return mediaRepository
            .findById(mediaDTO.getId())
            .map(existingMedia -> {
                mediaMapper.partialUpdate(existingMedia, mediaDTO);

                return existingMedia;
            })
            .map(mediaRepository::save)
            .map(mediaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MediaDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Medias");
        return mediaRepository.findAll(pageable).map(mediaMapper::toDto);
    }

    /**
     *  Get all the medias where ProductMain is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<MediaDTO> findAllWhereProductMainIsNull() {
        LOG.debug("Request to get all medias where ProductMain is null");
        return StreamSupport.stream(mediaRepository.findAll().spliterator(), false)
            .filter(media -> media.getProductMain() == null)
            .map(mediaMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     *  Get all the medias where PackMain is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<MediaDTO> findAllWherePackMainIsNull() {
        LOG.debug("Request to get all medias where PackMain is null");
        return StreamSupport.stream(mediaRepository.findAll().spliterator(), false)
            .filter(media -> media.getPackMain() == null)
            .map(mediaMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MediaDTO> findOne(Long id) {
        LOG.debug("Request to get Media : {}", id);
        return mediaRepository.findById(id).map(mediaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Media : {}", id);
        mediaRepository.deleteById(id);
    }
}
