package sn.samabutik.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class UserStaffDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserStaffDTO.class);
        UserStaffDTO userStaffDTO1 = new UserStaffDTO();
        userStaffDTO1.setId(1L);
        UserStaffDTO userStaffDTO2 = new UserStaffDTO();
        assertThat(userStaffDTO1).isNotEqualTo(userStaffDTO2);
        userStaffDTO2.setId(userStaffDTO1.getId());
        assertThat(userStaffDTO1).isEqualTo(userStaffDTO2);
        userStaffDTO2.setId(2L);
        assertThat(userStaffDTO1).isNotEqualTo(userStaffDTO2);
        userStaffDTO1.setId(null);
        assertThat(userStaffDTO1).isNotEqualTo(userStaffDTO2);
    }
}
