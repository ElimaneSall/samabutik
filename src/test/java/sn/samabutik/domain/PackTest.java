package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.MediaTestSamples.*;
import static sn.samabutik.domain.PackTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class PackTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Pack.class);
        Pack pack1 = getPackSample1();
        Pack pack2 = new Pack();
        assertThat(pack1).isNotEqualTo(pack2);

        pack2.setId(pack1.getId());
        assertThat(pack1).isEqualTo(pack2);

        pack2 = getPackSample2();
        assertThat(pack1).isNotEqualTo(pack2);
    }

    @Test
    void mainMediaTest() {
        Pack pack = getPackRandomSampleGenerator();
        Media mediaBack = getMediaRandomSampleGenerator();

        pack.setMainMedia(mediaBack);
        assertThat(pack.getMainMedia()).isEqualTo(mediaBack);

        pack.mainMedia(null);
        assertThat(pack.getMainMedia()).isNull();
    }

    @Test
    void galleryTest() {
        Pack pack = getPackRandomSampleGenerator();
        Media mediaBack = getMediaRandomSampleGenerator();

        pack.addGallery(mediaBack);
        assertThat(pack.getGalleries()).containsOnly(mediaBack);
        assertThat(mediaBack.getPackGallery()).isEqualTo(pack);

        pack.removeGallery(mediaBack);
        assertThat(pack.getGalleries()).doesNotContain(mediaBack);
        assertThat(mediaBack.getPackGallery()).isNull();

        pack.galleries(new HashSet<>(Set.of(mediaBack)));
        assertThat(pack.getGalleries()).containsOnly(mediaBack);
        assertThat(mediaBack.getPackGallery()).isEqualTo(pack);

        pack.setGalleries(new HashSet<>());
        assertThat(pack.getGalleries()).doesNotContain(mediaBack);
        assertThat(mediaBack.getPackGallery()).isNull();
    }
}
