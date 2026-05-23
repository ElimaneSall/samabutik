package sn.samabutik.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import sn.samabutik.domain.enumeration.PaymentProvider;
import sn.samabutik.domain.enumeration.TransactionStatus;

/**
 * A PaymentTransaction.
 */
@Entity
@Table(name = "payment_transaction")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaymentTransaction implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private PaymentProvider provider;

    @NotNull
    @Size(max = 100)
    @Column(name = "transaction_id", length = 100, nullable = false, unique = true)
    private String transactionId;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotNull
    @Size(max = 3)
    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status;

    @Size(max = 10000)
    @Column(name = "webhook_payload", length = 10000)
    private String webhookPayload;

    @Column(name = "processed_at")
    private Instant processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "orderItemses", "transactionses", "customer" }, allowSetters = true)
    private Order order;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PaymentTransaction id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PaymentProvider getProvider() {
        return this.provider;
    }

    public PaymentTransaction provider(PaymentProvider provider) {
        this.setProvider(provider);
        return this;
    }

    public void setProvider(PaymentProvider provider) {
        this.provider = provider;
    }

    public String getTransactionId() {
        return this.transactionId;
    }

    public PaymentTransaction transactionId(String transactionId) {
        this.setTransactionId(transactionId);
        return this;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public PaymentTransaction amount(BigDecimal amount) {
        this.setAmount(amount);
        return this;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return this.currency;
    }

    public PaymentTransaction currency(String currency) {
        this.setCurrency(currency);
        return this;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public TransactionStatus getStatus() {
        return this.status;
    }

    public PaymentTransaction status(TransactionStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public String getWebhookPayload() {
        return this.webhookPayload;
    }

    public PaymentTransaction webhookPayload(String webhookPayload) {
        this.setWebhookPayload(webhookPayload);
        return this;
    }

    public void setWebhookPayload(String webhookPayload) {
        this.webhookPayload = webhookPayload;
    }

    public Instant getProcessedAt() {
        return this.processedAt;
    }

    public PaymentTransaction processedAt(Instant processedAt) {
        this.setProcessedAt(processedAt);
        return this;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public Order getOrder() {
        return this.order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public PaymentTransaction order(Order order) {
        this.setOrder(order);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PaymentTransaction)) {
            return false;
        }
        return getId() != null && getId().equals(((PaymentTransaction) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PaymentTransaction{" +
            "id=" + getId() +
            ", provider='" + getProvider() + "'" +
            ", transactionId='" + getTransactionId() + "'" +
            ", amount=" + getAmount() +
            ", currency='" + getCurrency() + "'" +
            ", status='" + getStatus() + "'" +
            ", webhookPayload='" + getWebhookPayload() + "'" +
            ", processedAt='" + getProcessedAt() + "'" +
            "}";
    }
}
