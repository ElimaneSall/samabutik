package sn.samabutik.web.rest;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/media")
public class PublicMediaResource {

    @Value("${samabutik.upload-dir:medias}")
    private String uploadDir;

    @GetMapping("/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String relativePath = requestUri.replace("/api/public/media/files/", "");

        Path filePath = Paths.get(uploadDir, relativePath);

        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
    }
}
