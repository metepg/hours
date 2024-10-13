package com.metepg.hours.repository;

import com.metepg.hours.model.TimeEntry;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findAllByDateBetween(LocalDate startDate, LocalDate endDate, Sort sort);
}
