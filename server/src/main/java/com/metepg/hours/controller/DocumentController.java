package com.metepg.hours.controller;

import com.metepg.hours.service.DocumentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/document")
public class DocumentController {

    private final DocumentService documentService;


    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> generatePDF(@RequestParam int year, @RequestParam int month, @RequestParam int split) {
        byte[] pdf = documentService.generatePDF(year, month, split);
        return ResponseEntity.ok().body(pdf);
    }

}
