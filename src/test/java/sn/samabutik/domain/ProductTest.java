package sn.samabutik.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static sn.samabutik.domain.MediaTestSamples.*;
import static sn.samabutik.domain.OrderItemTestSamples.*;
import static sn.samabutik.domain.ProductTestSamples.*;
import static sn.samabutik.domain.StockMovementTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import sn.samabutik.web.rest.TestUtil;

class ProductTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Product.class);
        Product product1 = getProductSample1();
        Product product2 = new Product();
        assertThat(product1).isNotEqualTo(product2);

        product2.setId(product1.getId());
        assertThat(product1).isEqualTo(product2);

        product2 = getProductSample2();
        assertThat(product1).isNotEqualTo(product2);
    }

    @Test
    void mainMediaTest() {
        Product product = getProductRandomSampleGenerator();
        Media mediaBack = getMediaRandomSampleGenerator();

        product.setMainMedia(mediaBack);
        assertThat(product.getMainMedia()).isEqualTo(mediaBack);

        product.mainMedia(null);
        assertThat(product.getMainMedia()).isNull();
    }

    @Test
    void stockMovementsTest() {
        Product product = getProductRandomSampleGenerator();
        StockMovement stockMovementBack = getStockMovementRandomSampleGenerator();

        product.addStockMovements(stockMovementBack);
        assertThat(product.getStockMovementses()).containsOnly(stockMovementBack);
        assertThat(stockMovementBack.getProduct()).isEqualTo(product);

        product.removeStockMovements(stockMovementBack);
        assertThat(product.getStockMovementses()).doesNotContain(stockMovementBack);
        assertThat(stockMovementBack.getProduct()).isNull();

        product.stockMovementses(new HashSet<>(Set.of(stockMovementBack)));
        assertThat(product.getStockMovementses()).containsOnly(stockMovementBack);
        assertThat(stockMovementBack.getProduct()).isEqualTo(product);

        product.setStockMovementses(new HashSet<>());
        assertThat(product.getStockMovementses()).doesNotContain(stockMovementBack);
        assertThat(stockMovementBack.getProduct()).isNull();
    }

    @Test
    void galleryTest() {
        Product product = getProductRandomSampleGenerator();
        Media mediaBack = getMediaRandomSampleGenerator();

        product.addGallery(mediaBack);
        assertThat(product.getGalleries()).containsOnly(mediaBack);
        assertThat(mediaBack.getProductGallery()).isEqualTo(product);

        product.removeGallery(mediaBack);
        assertThat(product.getGalleries()).doesNotContain(mediaBack);
        assertThat(mediaBack.getProductGallery()).isNull();

        product.galleries(new HashSet<>(Set.of(mediaBack)));
        assertThat(product.getGalleries()).containsOnly(mediaBack);
        assertThat(mediaBack.getProductGallery()).isEqualTo(product);

        product.setGalleries(new HashSet<>());
        assertThat(product.getGalleries()).doesNotContain(mediaBack);
        assertThat(mediaBack.getProductGallery()).isNull();
    }

    @Test
    void orderItemTest() {
        Product product = getProductRandomSampleGenerator();
        OrderItem orderItemBack = getOrderItemRandomSampleGenerator();

        product.setOrderItem(orderItemBack);
        assertThat(product.getOrderItem()).isEqualTo(orderItemBack);
        assertThat(orderItemBack.getProductSnapshot()).isEqualTo(product);

        product.orderItem(null);
        assertThat(product.getOrderItem()).isNull();
        assertThat(orderItemBack.getProductSnapshot()).isNull();
    }
}
