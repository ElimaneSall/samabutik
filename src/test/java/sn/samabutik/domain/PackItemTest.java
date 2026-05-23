package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.PackItemTestSamples.*;
import static sn.samabutik.domain.PackTestSamples.*;
import static sn.samabutik.domain.ProductTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class PackItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PackItem.class);
        PackItem packItem1 = getPackItemSample1();
        PackItem packItem2 = new PackItem();
        assertThat(packItem1).isNotEqualTo(packItem2);

        packItem2.setId(packItem1.getId());
        assertThat(packItem1).isEqualTo(packItem2);

        packItem2 = getPackItemSample2();
        assertThat(packItem1).isNotEqualTo(packItem2);
    }

    @Test
    void packTest() {
        PackItem packItem = getPackItemRandomSampleGenerator();
        Pack packBack = getPackRandomSampleGenerator();

        packItem.setPack(packBack);
        assertThat(packItem.getPack()).isEqualTo(packBack);

        packItem.pack(null);
        assertThat(packItem.getPack()).isNull();
    }

    @Test
    void productTest() {
        PackItem packItem = getPackItemRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        packItem.setProduct(productBack);
        assertThat(packItem.getProduct()).isEqualTo(productBack);

        packItem.product(null);
        assertThat(packItem.getProduct()).isNull();
    }
}
