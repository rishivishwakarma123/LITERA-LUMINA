package com.litera.backend.controller;

import com.litera.backend.service.BookCoverStorage;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
public class BookCoverController {
    private final BookCoverStorage storage;

    public BookCoverController(BookCoverStorage storage) {
        this.storage = storage;
    }

    @PostMapping(path = "/api/uploads/book-covers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadCover(@RequestParam("file") MultipartFile file) {
        String filename = storage.store(file);
        URI imageUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/book-covers/")
                .path(filename)
                .build()
                .toUri();
        return Map.of("imageUrl", imageUri.toString());
    }

    @GetMapping("/uploads/book-covers/{filename}")
    public ResponseEntity<byte[]> getCover(@PathVariable String filename) {
        BookCoverStorage.StoredCover cover = storage.load(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cover.mediaType()))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(cover.content());
    }
}
