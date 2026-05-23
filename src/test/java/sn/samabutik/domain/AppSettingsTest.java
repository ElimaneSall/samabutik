package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.AppSettingsTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class AppSettingsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AppSettings.class);
        AppSettings appSettings1 = getAppSettingsSample1();
        AppSettings appSettings2 = new AppSettings();
        assertThat(appSettings1).isNotEqualTo(appSettings2);

        appSettings2.setId(appSettings1.getId());
        assertThat(appSettings1).isEqualTo(appSettings2);

        appSettings2 = getAppSettingsSample2();
        assertThat(appSettings1).isNotEqualTo(appSettings2);
    }
}
