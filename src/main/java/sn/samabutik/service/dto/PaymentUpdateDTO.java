package sn.samabutik.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import sn.samabutik.domain.enumeration.PaymentMethod;
import sn.samabutik.domain.enumeration.PaymentStatus;

public class PaymentUpdateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    private PaymentMethod paymentMethod;

    private String phoneNumber;

    private PaymentStatus paymentStatus;

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
