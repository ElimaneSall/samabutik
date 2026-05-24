package sn.samabutik.service;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.samabutik.domain.enumeration.MediaFormat;
import sn.samabutik.domain.enumeration.MediaType;
import sn.samabutik.web.rest.errors.BadRequestAlertException;

@Service
public class MediaStorageService {

    private static final Logger LOG = LoggerFactory.getLogger(MediaStorageService.class);

    @Value("${samabutik.upload-dir:medias}")
    private String uploadDir;

    // Allowed formats & sizes
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final String[] ALLOWED_IMAGE_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".webp" };
    private static final String[] ALLOWED_VIDEO_EXTENSIONS = { ".mp4" };

    public MediaUploadResult uploadFile(MultipartFile file, String entityType, Long entityId) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename).toLowerCase();
        MediaType mediaType = inferMediaType(extension);
        MediaFormat format = inferMediaFormat(extension);

        // Generate unique filename: UUID_timestamp.ext
        String filename = UUID.randomUUID() + "_" + Instant.now().toEpochMilli() + extension;

        // Path: medias/products/2026/05/filename.webp
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = Paths.get(uploadDir, entityType.toLowerCase(), datePath);
        Files.createDirectories(targetDir);

        Path targetPath = targetDir.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Optional: compress if image (hook for future optimization)
        if (mediaType == MediaType.IMAGE && !".webp".equals(extension)) {
            // TODO: Integrate image compression library (Thumbnailator, imgscalr)
            LOG.debug("Compression hook: {} → WEBP (not implemented yet)", originalFilename);
        }

        // Generate public URL (for local dev: /api/media/files/...)
        String publicUrl = "/api/media/files/" + entityType.toLowerCase() + "/" + datePath + "/" + filename;

        return new MediaUploadResult(publicUrl, mediaType, format, file.getSize(), filename);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestAlertException("Fichier vide", "media", "file.empty");
        }

        String filename = file.getOriginalFilename();
        String ext = getExtension(filename).toLowerCase();

        if (isImage(ext)) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new BadRequestAlertException("Image trop lourde (max 2Mo): " + filename, "media", "file.size.image");
            }
            if (!isAllowedImageExtension(ext)) {
                throw new BadRequestAlertException("Format image non supporté (JPG/PNG/WEBP): " + filename, "media", "file.format.image");
            }
        } else if (isVideo(ext)) {
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new BadRequestAlertException("Vidéo trop lourde (max 50Mo): " + filename, "media", "file.size.video");
            }
            if (!isAllowedVideoExtension(ext)) {
                throw new BadRequestAlertException("Format vidéo non supporté (MP4 uniquement): " + filename, "media", "file.format.video");
            }
        } else {
            throw new BadRequestAlertException("Type de fichier non supporté: " + filename, "media", "file.type");
        }
    }

    // Utility methods
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }

    private boolean isImage(String ext) {
        return isAllowedImageExtension(ext);
    }

    private boolean isVideo(String ext) {
        return isAllowedVideoExtension(ext);
    }

    private boolean isAllowedImageExtension(String ext) {
        for (String allowed : ALLOWED_IMAGE_EXTENSIONS) {
            if (allowed.equals(ext)) return true;
        }
        return false;
    }

    private boolean isAllowedVideoExtension(String ext) {
        for (String allowed : ALLOWED_VIDEO_EXTENSIONS) {
            if (allowed.equals(ext)) return true;
        }
        return false;
    }

    private MediaType inferMediaType(String ext) {
        return isVideo(ext) ? MediaType.VIDEO : MediaType.IMAGE;
    }

    private MediaFormat inferMediaFormat(String ext) {
        return switch (ext) {
            case ".jpg", ".jpeg" -> MediaFormat.JPG;
            case ".png" -> MediaFormat.PNG;
            case ".webp" -> MediaFormat.WEBP;
            case ".mp4" -> MediaFormat.MP4;
            default -> MediaFormat.JPG; // fallback
        };
    }

    public void deleteFile(String url) {
        try {
            // Parse URL: /api/media/files/products/2026/05/uuid.ext
            if (url != null && url.startsWith("/api/media/files/")) {
                String relativePath = url.replace("/api/media/files/", "");
                Path filePath = Paths.get(uploadDir, relativePath);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    LOG.debug("Deleted file: {}", filePath);
                }
            }
        } catch (IOException e) {
            LOG.warn("Failed to delete file: {}", url, e);
        }
    }

    // Result DTO
    public record MediaUploadResult(String url, MediaType type, MediaFormat format, Long sizeBytes, String filename) {}
}
