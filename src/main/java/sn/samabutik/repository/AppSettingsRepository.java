package sn.samabutik.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import sn.samabutik.domain.AppSettings;

/**
 * Spring Data JPA repository for the AppSettings entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettings, Long>, JpaSpecificationExecutor<AppSettings> {}
