package com.metepg.hours.controller;

import com.metepg.hours.dto.TimeEntryDTO;
import com.metepg.hours.service.TimeEntryService;
import com.metepg.hours.utils.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/time-entry")
public class TimeEntryController {
    private static final Logger logger = LoggerFactory.getLogger(TimeEntryController.class);
    private final TimeEntryService timeEntryService;

    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<TimeEntryDTO>> getAllTimeEntries() {
        List<TimeEntryDTO> timeEntries = timeEntryService.findAll();
        return ResponseEntity.ok(timeEntries);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<TimeEntryDTO> addTimeEntry(@Valid @RequestBody TimeEntryDTO timeEntryDTO) {
        TimeEntryDTO createdTimeEntryDTO = timeEntryService.save(timeEntryDTO);
        logger.info("User {} successfully added time entry for date: {}", SecurityUtils.getCurrentUsername(), createdTimeEntryDTO.date());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTimeEntryDTO);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update")
    public ResponseEntity<TimeEntryDTO> updateTimeEntry(@Valid @RequestBody TimeEntryDTO timeEntryDTO) {
        TimeEntryDTO updatedTimeEntryDTO = timeEntryService.update(timeEntryDTO);
        logger.info("User {} successfully updated time entry for date: {}", SecurityUtils.getCurrentUsername(), updatedTimeEntryDTO.date());
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(updatedTimeEntryDTO);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable Long id) {
        timeEntryService.delete(id);
        logger.info("User {} successfully deleted time entry with ID: {}", SecurityUtils.getCurrentUsername(), id);
        return ResponseEntity.noContent().build();
    }
}