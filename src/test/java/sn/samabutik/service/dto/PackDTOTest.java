package sn.samabutik.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class PackDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PackDTO.class);
        PackDTO packDTO1 = new PackDTO();
        packDTO1.setId(1L);
        PackDTO packDTO2 = new PackDTO();
        assertThat(packDTO1).isNotEqualTo(packDTO2);
        packDTO2.setId(packDTO1.getId());
        assertThat(packDTO1).isEqualTo(packDTO2);
        packDTO2.setId(2L);
        assertThat(packDTO1).isNotEqualTo(packDTO2);
        packDTO1.setId(null);
        assertThat(packDTO1).isNotEqualTo(packDTO2);
    }
}
