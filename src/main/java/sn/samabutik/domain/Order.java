package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import sn.samabutik.domain.enumeration.OrderStatus;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;

/**
 * A Order.
 */
@Entity
@Table(name = "jhi_order")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Order implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "order_number", length = 20, nullable = false, unique = true)
    private String orderNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "total_amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @NotNull
    @Size(max = 3)
    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Size(max = 100)
    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @NotNull
    @Size(max = 500)
    @Column(name = "shipping_address", length = 500, nullable = false)
    private String shippingAddress;

    @DecimalMin(value = "0")
    @Column(name = "shipping_cost", precision = 21, scale = 2)
    private BigDecimal shippingCost;

    @Size(max = 1000)
    @Column(name = "delivery_note", length = 1000)
    private String deliveryNote;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "order")
    @JsonIgnoreProperties(value = { "productSnapshot", "order" }, allowSetters = true)
    private Set<OrderItem> orderItemses = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "order")
    @JsonIgnoreProperties(value = { "order" }, allowSetters = true)
    private Set<PaymentTransaction> transactionses = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "orderses" }, allowSetters = true)
    private Customer customer;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Order id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return this.orderNumber;
    }

    public Order orderNumber(String orderNumber) {
        this.setOrderNumber(orderNumber);
        return this;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public OrderStatus getStatus() {
        return this.status;
    }

    public Order status(OrderStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return this.totalAmount;
    }

    public Order totalAmount(BigDecimal totalAmount) {
        this.setTotalAmount(totalAmount);
        return this;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return this.currency;
    }

    public Order currency(String currency) {
        this.setCurrency(currency);
        return this;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentMethod getPaymentMethod() {
        return this.paymentMethod;
    }

    public Order paymentMethod(PaymentMethod paymentMethod) {
        this.setPaymentMethod(paymentMethod);
        return this;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return this.paymentStatus;
    }

    public Order paymentStatus(PaymentStatus paymentStatus) {
        this.setPaymentStatus(paymentStatus);
        return this;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentReference() {
        return this.paymentReference;
    }

    public Order paymentReference(String paymentReference) {
        this.setPaymentReference(paymentReference);
        return this;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getShippingAddress() {
        return this.shippingAddress;
    }

    public Order shippingAddress(String shippingAddress) {
        this.setShippingAddress(shippingAddress);
        return this;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public BigDecimal getShippingCost() {
        return this.shippingCost;
    }

    public Order shippingCost(BigDecimal shippingCost) {
        this.setShippingCost(shippingCost);
        return this;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public String getDeliveryNote() {
        return this.deliveryNote;
    }

    public Order deliveryNote(String deliveryNote) {
        this.setDeliveryNote(deliveryNote);
        return this;
    }

    public void setDeliveryNote(String deliveryNote) {
        this.deliveryNote = deliveryNote;
    }

    public Instant getDeliveredAt() {
        return this.deliveredAt;
    }

    public Order deliveredAt(Instant deliveredAt) {
        this.setDeliveredAt(deliveredAt);
        return this;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Set<OrderItem> getOrderItemses() {
        return this.orderItemses;
    }

    public void setOrderItemses(Set<OrderItem> orderItems) {
        if (this.orderItemses != null) {
            this.orderItemses.forEach(i -> i.setOrder(null));
        }
        if (orderItems != null) {
            orderItems.forEach(i -> i.setOrder(this));
        }
        this.orderItemses = orderItems;
    }

    public Order orderItemses(Set<OrderItem> orderItems) {
        this.setOrderItemses(orderItems);
        return this;
    }

    public Order addOrderItems(OrderItem orderItem) {
        this.orderItemses.add(orderItem);
        orderItem.setOrder(this);
        return this;
    }

    public Order removeOrderItems(OrderItem orderItem) {
        this.orderItemses.remove(orderItem);
        orderItem.setOrder(null);
        return this;
    }

    public Set<PaymentTransaction> getTransactionses() {
        return this.transactionses;
    }

    public void setTransactionses(Set<PaymentTransaction> paymentTransactions) {
        if (this.transactionses != null) {
            this.transactionses.forEach(i -> i.setOrder(null));
        }
        if (paymentTransactions != null) {
            paymentTransactions.forEach(i -> i.setOrder(this));
        }
        this.transactionses = paymentTransactions;
    }

    public Order transactionses(Set<PaymentTransaction> paymentTransactions) {
        this.setTransactionses(paymentTransactions);
        return this;
    }

    public Order addTransactions(PaymentTransaction paymentTransaction) {
        this.transactionses.add(paymentTransaction);
        paymentTransaction.setOrder(this);
        return this;
    }

    public Order removeTransactions(PaymentTransaction paymentTransaction) {
        this.transactionses.remove(paymentTransaction);
        paymentTransaction.setOrder(null);
        return this;
    }

    public Customer getCustomer() {
        return this.customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Order customer(Customer customer) {
        this.setCustomer(customer);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Order)) {
            return false;
        }
        return getId() != null && getId().equals(((Order) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Order{" +
            "id=" + getId() +
            ", orderNumber='" + getOrderNumber() + "'" +
            ", status='" + getStatus() + "'" +
            ", totalAmount=" + getTotalAmount() +
            ", currency='" + getCurrency() + "'" +
            ", paymentMethod='" + getPaymentMethod() + "'" +
            ", paymentStatus='" + getPaymentStatus() + "'" +
            ", paymentReference='" + getPaymentReference() + "'" +
            ", shippingAddress='" + getShippingAddress() + "'" +
            ", shippingCost=" + getShippingCost() +
            ", deliveryNote='" + getDeliveryNote() + "'" +
            ", deliveredAt='" + getDeliveredAt() + "'" +
            "}";
    }
}
