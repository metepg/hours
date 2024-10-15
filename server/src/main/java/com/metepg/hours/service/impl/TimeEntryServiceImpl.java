package com.metepg.hours.service.impl;

import com.metepg.hours.dto.TimeEntryDTO;
import com.metepg.hours.model.TimeEntry;
import com.metepg.hours.repository.TimeEntryRepository;
import com.metepg.hours.service.TimeEntryService;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeEntryServiceImpl implements TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;

    public TimeEntryServiceImpl(TimeEntryRepository timeEntryRepository) {
        this.timeEntryRepository = timeEntryRepository;
    }

    @Override
    public TimeEntryDTO save(TimeEntryDTO timeEntryDTO) {
        TimeEntry timeEntry = convertFromDTO(timeEntryDTO);
        TimeEntry savedTimeEntry = timeEntryRepository.save(timeEntry);
        return convertToDTO(savedTimeEntry);
    }

    @Override
    public List<TimeEntryDTO> findAll() {
        return timeEntryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TimeEntryDTO update(TimeEntryDTO timeEntryDTO) {
        TimeEntry timeEntry = convertFromDTO(timeEntryDTO);
        TimeEntry updatedTimeEntry = timeEntryRepository.save(timeEntry);
        return convertToDTO(updatedTimeEntry);
    }

    @Override
    public void delete(Long id) {
        try {
            timeEntryRepository.deleteById(id);
        }
        catch (EmptyResultDataAccessException ex) {
            throw new RuntimeException("TimeEntry with ID " + id + " not found.");
        }
    }

    private TimeEntry convertFromDTO(TimeEntryDTO timeEntryDTO) {
        Long id = timeEntryDTO.id();
        LocalDate date = timeEntryDTO.date();
        LocalTime startTime = timeEntryDTO.startTime();
        LocalTime endTime = timeEntryDTO.endTime();
        Boolean hasLunch = timeEntryDTO.hasLunch();

        TimeEntry timeEntry = new TimeEntry();
        timeEntry.setId(id);
        timeEntry.setDate(date);
        timeEntry.setStartTime(startTime);
        timeEntry.setEndTime(endTime);
        timeEntry.setHasLunch(hasLunch);
        return timeEntry;
    }

    private TimeEntryDTO convertToDTO(TimeEntry timeEntry) {
        return new TimeEntryDTO(timeEntry.getId(), timeEntry.getDate(), timeEntry.getStartTime(), timeEntry.getEndTime(), timeEntry.getHasLunch());
    }

    @Override
    public List<TimeEntry> findEntriesByMonthAndSplit(int year, int month, int split) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate;
        LocalDate endDate;

        if (split == 1) {
            startDate = yearMonth.atDay(1);
            endDate = yearMonth.atDay(15);
        } else {
            startDate = yearMonth.atDay(16);
            endDate = yearMonth.atEndOfMonth();
        }

        return timeEntryRepository.findAllByDateBetween(startDate, endDate, Sort.by(Sort.Direction.ASC, "date"));
    }
}
