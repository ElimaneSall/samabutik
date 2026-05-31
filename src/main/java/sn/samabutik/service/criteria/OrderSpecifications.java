package sn.samabutik.service.criteria;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.time.Instant;
import org.springframework.data.jpa.domain.Specification;
import sn.samabutik.domain.Customer; // Ajustez selon votre package réel
import sn.samabutik.domain.Order;
import sn.samabutik.domain.enumeration.OrderStatus;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;

public class OrderSpecifications {

    /**
     * Recherche globale (Barre de recherche) :
     * Match partiel sur le numéro de commande OU le numéro de téléphone du client
     */
    public static Specification<Order> searchByNumberOrCustomer(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return cb.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            // Filtre sur le numéro de commande
            var orderNumberPredicate = cb.like(cb.lower(root.get("orderNumber")), likePattern);

            // Jointure sur le client (Left Join pour ne pas exclure les commandes sans client)
            Join<Order, Customer> customerJoin = root.join("customer", JoinType.LEFT);
            var customerPhonePredicate = cb.like(customerJoin.get("phone"), likePattern);

            // Optionnel : si votre entité Customer a un champ 'name' ou 'firstName'
            // var customerNamePredicate = cb.like(cb.lower(customerJoin.get("name")), likePattern);

            return cb.or(orderNumberPredicate, customerPhonePredicate);
        };
    }

    /**
     * Filtre exact par statut de la commande (PENDING, PAID, PREPARING, SHIPPED, DELIVERED)
     */
    public static Specification<Order> byStatus(OrderStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    /**
     * Filtre exact par méthode de paiement (WAVE, ORANGE_MONEY, CASH)
     */
    public static Specification<Order> byPaymentMethod(PaymentMethod method) {
        return (root, query, cb) -> method == null ? cb.conjunction() : cb.equal(root.get("paymentMethod"), method);
    }

    /**
     * Filtre exact par statut du paiement (PENDING, SUCCESS, FAILED)
     */
    public static Specification<Order> byPaymentStatus(PaymentStatus paymentStatus) {
        return (root, query, cb) -> paymentStatus == null ? cb.conjunction() : cb.equal(root.get("paymentStatus"), paymentStatus);
    }

    /**
     * Filtre par plage de dates de livraison (Utile pour la comptabilité / bilans)
     */
    public static Specification<Order> deliveredBetween(Instant start, Instant end) {
        return (root, query, cb) -> {
            if (start != null && end != null) {
                return cb.between(root.get("deliveredAt"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("deliveredAt"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(root.get("deliveredAt"), end);
            }
            return cb.conjunction();
        };
    }
}
