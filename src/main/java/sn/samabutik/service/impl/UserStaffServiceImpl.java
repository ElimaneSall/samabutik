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
import sn.samabutik.domain.UserStaff;
import sn.samabutik.repository.UserStaffRepository;
import sn.samabutik.service.UserStaffService;
import sn.samabutik.service.dto.UserStaffDTO;
import sn.samabutik.service.mapper.UserStaffMapper;

/**
 * Service Implementation for managing {@link sn.samabutik.domain.UserStaff}.
 */
@Service
@Transactional
public class UserStaffServiceImpl implements UserStaffService {

    private static final Logger LOG = LoggerFactory.getLogger(UserStaffServiceImpl.class);

    private final UserStaffRepository userStaffRepository;

    private final UserStaffMapper userStaffMapper;

    public UserStaffServiceImpl(UserStaffRepository userStaffRepository, UserStaffMapper userStaffMapper) {
        this.userStaffRepository = userStaffRepository;
        this.userStaffMapper = userStaffMapper;
    }

    @Override
    public UserStaffDTO save(UserStaffDTO userStaffDTO) {
        LOG.debug("Request to save UserStaff : {}", userStaffDTO);
        UserStaff userStaff = userStaffMapper.toEntity(userStaffDTO);
        userStaff = userStaffRepository.save(userStaff);
        return userStaffMapper.toDto(userStaff);
    }

    @Override
    public UserStaffDTO update(UserStaffDTO userStaffDTO) {
        LOG.debug("Request to update UserStaff : {}", userStaffDTO);
        UserStaff userStaff = userStaffMapper.toEntity(userStaffDTO);
        userStaff = userStaffRepository.save(userStaff);
        return userStaffMapper.toDto(userStaff);
    }

    @Override
    public Optional<UserStaffDTO> partialUpdate(UserStaffDTO userStaffDTO) {
        LOG.debug("Request to partially update UserStaff : {}", userStaffDTO);

        return userStaffRepository
            .findById(userStaffDTO.getId())
            .map(existingUserStaff -> {
                userStaffMapper.partialUpdate(existingUserStaff, userStaffDTO);

                return existingUserStaff;
            })
            .map(userStaffRepository::save)
            .map(userStaffMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserStaffDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all UserStaffs");
        return userStaffRepository.findAll(pageable).map(userStaffMapper::toDto);
    }

    /**
     *  Get all the userStaffs where StockMovement is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<UserStaffDTO> findAllWhereStockMovementIsNull() {
        LOG.debug("Request to get all userStaffs where StockMovement is null");
        return StreamSupport.stream(userStaffRepository.findAll().spliterator(), false)
            .filter(userStaff -> userStaff.getStockMovement() == null)
            .map(userStaffMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserStaffDTO> findOne(Long id) {
        LOG.debug("Request to get UserStaff : {}", id);
        return userStaffRepository.findById(id).map(userStaffMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete UserStaff : {}", id);
        userStaffRepository.deleteById(id);
    }
}
