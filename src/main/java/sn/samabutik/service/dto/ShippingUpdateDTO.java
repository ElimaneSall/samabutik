package sn.samabutik.service.dto;

import java.io.Serializable;

public class ShippingUpdateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String shippingAddress;
    private String deliveryNote;

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getDeliveryNote() {
        return deliveryNote;
    }

    public void setDeliveryNote(String deliveryNote) {
        this.deliveryNote = deliveryNote;
    }
}
