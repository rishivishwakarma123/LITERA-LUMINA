package com.litera.backend;

import com.litera.backend.service.BookCoverStorage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;

class BookCoverStorageTests {
    private static final byte[] PNG_HEADER = {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    @TempDir
    Path temporaryDirectory;

    @Test
    void storesAndLoadsPngCover() throws Exception {
        BookCoverStorage storage = new BookCoverStorage(temporaryDirectory.toString());
        MockMultipartFile upload = new MockMultipartFile(
                "file", "cover.png", "image/png", PNG_HEADER);

        String filename = storage.store(upload);
        BookCoverStorage.StoredCover storedCover = storage.load(filename);

        Assertions.assertEquals("image/png", storedCover.mediaType());
        Assertions.assertArrayEquals(PNG_HEADER, storedCover.content());
        Assertions.assertTrue(Files.isRegularFile(
                temporaryDirectory.resolve("book-covers").resolve(filename)));
    }

    @Test
    void rejectsFilesThatAreNotSupportedImages() {
        BookCoverStorage storage = new BookCoverStorage(temporaryDirectory.toString());
        MockMultipartFile upload = new MockMultipartFile(
                "file", "cover.png", "image/png", new byte[]{1, 2, 3, 4});

        ResponseStatusException exception = Assertions.assertThrows(
                ResponseStatusException.class, () -> storage.store(upload));

        Assertions.assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void rejectsOversizedCoverImages() {
        BookCoverStorage storage = new BookCoverStorage(temporaryDirectory.toString());
        MockMultipartFile upload = new MockMultipartFile(
                "file", "cover.png", "image/png", new byte[5 * 1024 * 1024 + 1]);

        ResponseStatusException exception = Assertions.assertThrows(
                ResponseStatusException.class, () -> storage.store(upload));

        Assertions.assertEquals(413, exception.getStatusCode().value());
    }
}
