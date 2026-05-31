package sn.samabutik.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import sn.samabutik.domain.enumeration.OrderStatus;

public class OrderTrackingDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private OrderStatus status;

    private List<TimelineStepDTO> timeline;

    private String estimatedDelivery;

    private CourierInfoDTO courier;

    // Getters/Setters
    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public List<TimelineStepDTO> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<TimelineStepDTO> timeline) {
        this.timeline = timeline;
    }

    public String getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public void setEstimatedDelivery(String estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }

    public CourierInfoDTO getCourier() {
        return courier;
    }

    public void setCourier(CourierInfoDTO courier) {
        this.courier = courier;
    }

    // === Nested DTOs ===

    public static class TimelineStepDTO implements Serializable {

        private String label;
        private TimelineStatus status;
        private Instant timestamp;
        private String description;

        public enum TimelineStatus {
            COMPLETED,
            ACTIVE,
            PENDING,
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public TimelineStatus getStatus() {
            return status;
        }

        public void setStatus(TimelineStatus status) {
            this.status = status;
        }

        public Instant getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Instant timestamp) {
            this.timestamp = timestamp;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class CourierInfoDTO implements Serializable {

        private String name;
        private String phone;
        private String photoUrl;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }
    }
}
