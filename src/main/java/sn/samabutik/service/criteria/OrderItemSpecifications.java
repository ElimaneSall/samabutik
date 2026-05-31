package sn.samabutik.service.criteria;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Order;
import sn.samabutik.domain.OrderItem;
import sn.samabutik.domain.Product;
import sn.samabutik.domain.enumeration.OrderStatus;
import sn.samabutik.domain.enumeration.PaymentMethod;

public class OrderItemSpecifications {

    /**
     * Recherche globale (Barre de recherche) :
     * Match partiel sur le nom du produit, SKU, ou le numéro de commande associé
     */
    public static Specification<OrderItem> searchByProductOrOrder(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return cb.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            var productNamePredicate = cb.like(cb.lower(root.get("productName")), likePattern);
            var productSkuPredicate = cb.like(cb.lower(root.get("productSku")), likePattern);

            Join<OrderItem, Order> orderJoin = root.join("order", JoinType.LEFT);
            var orderNumberPredicate = cb.like(cb.lower(orderJoin.get("orderNumber")), likePattern);

            return cb.or(productNamePredicate, productSkuPredicate, orderNumberPredicate);
        };
    }

    /**
     * Filtre par ID de commande (Order)
     */
    public static Specification<OrderItem> byOrderId(Long orderId) {
        return (root, query, cb) -> {
            if (orderId == null) {
                return cb.conjunction();
            }
            Join<OrderItem, Order> orderJoin = root.join("order", JoinType.INNER);
            return cb.equal(orderJoin.get("id"), orderId);
        };
    }

    /**
     * Filtre par type d'article (Pack item ou non)
     */
    public static Specification<OrderItem> byIsPackItem(Boolean isPackItem) {
        return (root, query, cb) -> {
            if (isPackItem == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("isPackItem"), isPackItem);
        };
    }

    /**
     * Filtre par ID de produit (via productSnapshot)
     */
    public static Specification<OrderItem> byProductId(Long productId) {
        return (root, query, cb) -> {
            if (productId == null) {
                return cb.conjunction();
            }
            Join<OrderItem, Product> productJoin = root.join("productSnapshot", JoinType.INNER);
            return cb.equal(productJoin.get("id"), productId);
        };
    }

    /**
     * Filtre par nom de produit (exact ou partiel)
     */
    public static Specification<OrderItem> byProductName(String productName) {
        return (root, query, cb) -> {
            if (productName == null || productName.isBlank()) {
                return cb.conjunction();
            }
            String likePattern = "%" + productName.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("productName")), likePattern);
        };
    }

    /**
     * Filtre par quantité minimale
     */
    public static Specification<OrderItem> byMinQuantity(Integer minQuantity) {
        return (root, query, cb) -> {
            if (minQuantity == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("quantity"), minQuantity);
        };
    }

    /**
     * Filtre par quantité maximale
     */
    public static Specification<OrderItem> byMaxQuantity(Integer maxQuantity) {
        return (root, query, cb) -> {
            if (maxQuantity == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get("quantity"), maxQuantity);
        };
    }

    /**
     * Filtre par plage de sous-total
     */
    public static Specification<OrderItem> bySubtotalBetween(java.math.BigDecimal minSubtotal, java.math.BigDecimal maxSubtotal) {
        return (root, query, cb) -> {
            if (minSubtotal != null && maxSubtotal != null) {
                return cb.between(root.get("subtotal"), minSubtotal, maxSubtotal);
            } else if (minSubtotal != null) {
                return cb.greaterThanOrEqualTo(root.get("subtotal"), minSubtotal);
            } else if (maxSubtotal != null) {
                return cb.lessThanOrEqualTo(root.get("subtotal"), maxSubtotal);
            }
            return cb.conjunction();
        };
    }

    /**
     * Filtre par statut de la commande associée
     */
    public static Specification<OrderItem> byOrderStatus(OrderStatus orderStatus) {
        return (root, query, cb) -> {
            if (orderStatus == null) {
                return cb.conjunction();
            }
            Join<OrderItem, Order> orderJoin = root.join("order", JoinType.INNER);
            return cb.equal(orderJoin.get("status"), orderStatus);
        };
    }

    /**
     * Filtre par méthode de paiement de la commande associée
     */
    public static Specification<OrderItem> byPaymentMethod(PaymentMethod paymentMethod) {
        return (root, query, cb) -> {
            if (paymentMethod == null) {
                return cb.conjunction();
            }
            Join<OrderItem, Order> orderJoin = root.join("order", JoinType.INNER);
            return cb.equal(orderJoin.get("paymentMethod"), paymentMethod);
        };
    }

    /**
     * Filtre par plage de date de création (via la commande associée)
     */
    public static Specification<OrderItem> byOrderCreatedAtBetween(java.time.Instant start, java.time.Instant end) {
        return (root, query, cb) -> {
            Join<OrderItem, Order> orderJoin = root.join("order", JoinType.INNER);
            if (start != null && end != null) {
                return cb.between(orderJoin.get("createdAt"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(orderJoin.get("createdAt"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(orderJoin.get("createdAt"), end);
            }
            return cb.conjunction();
        };
    }

    /**
     * Filtre par prix unitaire minimum
     */
    public static Specification<OrderItem> byMinUnitPrice(java.math.BigDecimal minUnitPrice) {
        return (root, query, cb) -> {
            if (minUnitPrice == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("unitPrice"), minUnitPrice);
        };
    }

    /**
     * Filtre par prix unitaire maximum
     */
    public static Specification<OrderItem> byMaxUnitPrice(java.math.BigDecimal maxUnitPrice) {
        return (root, query, cb) -> {
            if (maxUnitPrice == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get("unitPrice"), maxUnitPrice);
        };
    }

    /**
     * Filtre par combinaison de nom de produit et statut de commande
     */
    public static Specification<OrderItem> byProductNameAndOrderStatus(String productName, OrderStatus orderStatus) {
        return Specification.where(byProductName(productName)).and(byOrderStatus(orderStatus));
    }

    /**
     * Filtre par combinaison de commande et type d'article
     */
    public static Specification<OrderItem> byOrderIdAndPackStatus(Long orderId, Boolean isPackItem) {
        return Specification.where(byOrderId(orderId)).and(byIsPackItem(isPackItem));
    }
}
