package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.MediaTestSamples.*;
import static sn.samabutik.domain.PackTestSamples.*;
import static sn.samabutik.domain.ProductTestSamples.*;

import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class MediaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Media.class);
        Media media1 = getMediaSample1();
        Media media2 = new Media();
        assertThat(media1).isNotEqualTo(media2);

        media2.setId(media1.getId());
        assertThat(media1).isEqualTo(media2);

        media2 = getMediaSample2();
        assertThat(media1).isNotEqualTo(media2);
    }

    @Test
    void productMainTest() {
        Media media = getMediaRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        media.setProductMain(productBack);
        assertThat(media.getProductMain()).isEqualTo(productBack);
        assertThat(productBack.getMainMedia()).isEqualTo(media);

        media.productMain(null);
        assertThat(media.getProductMain()).isNull();
        assertThat(productBack.getMainMedia()).isNull();
    }

    @Test
    void packMainTest() {
        Media media = getMediaRandomSampleGenerator();
        Pack packBack = getPackRandomSampleGenerator();

        media.setPackMain(packBack);
        assertThat(media.getPackMain()).isEqualTo(packBack);
        assertThat(packBack.getMainMedia()).isEqualTo(media);

        media.packMain(null);
        assertThat(media.getPackMain()).isNull();
        assertThat(packBack.getMainMedia()).isNull();
    }

    @Test
    void productGalleryTest() {
        Media media = getMediaRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        media.setProductGallery(productBack);
        assertThat(media.getProductGallery()).isEqualTo(productBack);

        media.productGallery(null);
        assertThat(media.getProductGallery()).isNull();
    }

    @Test
    void packGalleryTest() {
        Media media = getMediaRandomSampleGenerator();
        Pack packBack = getPackRandomSampleGenerator();

        media.setPackGallery(packBack);
        assertThat(media.getPackGallery()).isEqualTo(packBack);

        media.packGallery(null);
        assertThat(media.getPackGallery()).isNull();
    }
}
