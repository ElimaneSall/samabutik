package sn.samabutik.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaWebConfig implements WebMvcConfigurer {

    @Value("${samabutik.upload-dir:medias}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve /api/media/files/** from local medias/ directory
        registry.addResourceHandler("/api/media/files/**").addResourceLocations("file:" + uploadDir + "/");
    }
}
