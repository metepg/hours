package com.metepg.hours.service;

import com.metepg.hours.dto.TimeEntryDTO;
import com.metepg.hours.model.TimeEntry;
import jakarta.validation.Valid;

import java.util.List;

public interface TimeEntryService {
    TimeEntryDTO save(TimeEntryDTO timeEntryDTO);
    List<TimeEntryDTO> findAll();
    TimeEntryDTO update(@Valid TimeEntryDTO timeEntryDTO);
    List<TimeEntry> findEntriesByMonthAndSplit(int year, int month, int split);
    void delete(Long id);
}