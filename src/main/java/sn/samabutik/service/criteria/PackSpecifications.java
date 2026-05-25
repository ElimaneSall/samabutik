package sn.samabutik.service.criteria;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Pack;

public class PackSpecifications {

    public static Specification<Pack> searchByName(String searchTerm) {
        return (Root<Pack> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), likePattern);
        };
    }

    public static Specification<Pack> byDiscountType(String discountType) {
        return (Root<Pack> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.equal(root.get("discountType"), discountType);
    }

    public static Specification<Pack> byIsActive(Boolean isActive) {
        return (Root<Pack> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.equal(root.get("isActive"), isActive);
    }

    public static Specification<Pack> byDisplayOnHomepage(Boolean displayOnHomepage) {
        return (Root<Pack> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.equal(root.get("displayOnHomepage"), displayOnHomepage);
    }
}
