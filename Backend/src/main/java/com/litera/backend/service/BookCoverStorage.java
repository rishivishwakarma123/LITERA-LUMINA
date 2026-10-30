package com.litera.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookCoverStorage {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private final Path coverDirectory;

    public BookCoverStorage(@Value("${app.upload.directory:./uploads}") String uploadDirectory) {
        this.coverDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize().resolve("book-covers");
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a cover image to upload");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(413),
                    "Cover images must be 5 MB or smaller");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read the uploaded cover image", exception);
        }

        String extension = detectImageExtension(content);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose a valid JPG, PNG, or WebP image");
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path destination = coverDirectory.resolve(filename).normalize();
        if (!destination.startsWith(coverDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cover image");
        }

        try {
            Files.createDirectories(coverDirectory);
            Files.write(destination, content);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store the uploaded cover image", exception);
        }
        return filename;
    }

    public StoredCover load(String filename) {
        if (filename == null || !filename.matches(
                "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cover image not found");
        }

        Path imagePath = coverDirectory.resolve(filename).normalize();
        if (!imagePath.startsWith(coverDirectory) || !Files.isRegularFile(imagePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cover image not found");
        }

        try {
            String mediaType = switch (imagePath.getFileName().toString().substring(
                    imagePath.getFileName().toString().lastIndexOf('.') + 1)) {
                case "jpg" -> "image/jpeg";
                case "png" -> "image/png";
                case "webp" -> "image/webp";
                default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cover image not found");
            };
            return new StoredCover(Files.readAllBytes(imagePath), mediaType);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read the stored cover image", exception);
        }
    }

    private String detectImageExtension(byte[] content) {
        if (content.length >= 3 && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xFF) == 0xD8 && (content[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (content.length >= 8 && (content[0] & 0xFF) == 0x89
                && content[1] == 0x50 && content[2] == 0x4E && content[3] == 0x47
                && content[4] == 0x0D && content[5] == 0x0A
                && content[6] == 0x1A && content[7] == 0x0A) {
            return "png";
        }
        if (content.length >= 12 && content[0] == 'R' && content[1] == 'I'
                && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'E'
                && content[10] == 'B' && content[11] == 'P') {
            return "webp";
        }
        return null;
    }

    public record StoredCover(byte[] content, String mediaType) {
    }
}
