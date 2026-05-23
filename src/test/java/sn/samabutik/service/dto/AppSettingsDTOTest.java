package sn.samabutik.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class AppSettingsDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AppSettingsDTO.class);
        AppSettingsDTO appSettingsDTO1 = new AppSettingsDTO();
        appSettingsDTO1.setId(1L);
        AppSettingsDTO appSettingsDTO2 = new AppSettingsDTO();
        assertThat(appSettingsDTO1).isNotEqualTo(appSettingsDTO2);
        appSettingsDTO2.setId(appSettingsDTO1.getId());
        assertThat(appSettingsDTO1).isEqualTo(appSettingsDTO2);
        appSettingsDTO2.setId(2L);
        assertThat(appSettingsDTO1).isNotEqualTo(appSettingsDTO2);
        appSettingsDTO1.setId(null);
        assertThat(appSettingsDTO1).isNotEqualTo(appSettingsDTO2);
    }
}
