package sn.samabutik.service.criteria;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Product;

public class ProductSpecifications {

    /**
     * Recherche par nom OU SKU (case-insensitive, partial match)
     */
    public static Specification<Product> searchByNameOrSku(String searchTerm) {
        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("name")), likePattern), cb.like(cb.lower(root.get("sku")), likePattern));
        };
    }

    /**
     * Filtre par catégorie exacte (case-insensitive)
     */
    public static Specification<Product> byCategory(String category) {
        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
            cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    /**
     * Filtre par statut de stock :
     * - "instock" : stock > 0
     * - "lowstock" : 0 < stock <= lowStockThreshold
     * - "outofstock" : stock = 0
     */
    public static Specification<Product> byStockStatus(String stockFilter) {
        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            return switch (stockFilter) {
                case "instock" -> cb.greaterThan(root.get("stock"), 0);
                case "lowstock" -> cb.and(
                    cb.greaterThan(root.get("stock"), 0),
                    cb.lessThanOrEqualTo(root.get("stock"), root.get("lowStockThreshold"))
                );
                case "outofstock" -> cb.equal(root.get("stock"), 0);
                default -> cb.conjunction(); // No filter
            };
        };
    }
}
