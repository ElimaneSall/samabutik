package sn.samabutik.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class PackItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PackItemDTO.class);
        PackItemDTO packItemDTO1 = new PackItemDTO();
        packItemDTO1.setId(1L);
        PackItemDTO packItemDTO2 = new PackItemDTO();
        assertThat(packItemDTO1).isNotEqualTo(packItemDTO2);
        packItemDTO2.setId(packItemDTO1.getId());
        assertThat(packItemDTO1).isEqualTo(packItemDTO2);
        packItemDTO2.setId(2L);
        assertThat(packItemDTO1).isNotEqualTo(packItemDTO2);
        packItemDTO1.setId(null);
        assertThat(packItemDTO1).isNotEqualTo(packItemDTO2);
    }
}
