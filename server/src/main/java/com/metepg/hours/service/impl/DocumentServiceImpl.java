package com.metepg.hours.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.metepg.hours.model.TimeEntry;
import com.metepg.hours.service.DocumentService;
import com.metepg.hours.service.TimeEntryService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
public class DocumentServiceImpl implements DocumentService {
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.forLanguageTag("fi"));
    private final TimeEntryService timeEntryService;

    public DocumentServiceImpl(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @Override
    public byte[] generatePDF(int year, int month, int split) {
        List<TimeEntry> entries = timeEntryService.findEntriesByMonthAndSplit(year, month, split);
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addMonthNameParagraph(document, year, month, split, entries);
            addTable(document, entries);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException(e);
        }

        return outputStream.toByteArray();
    }

    private void addTable(Document document, List<TimeEntry> entries) throws DocumentException {
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12f);

        float[] columnWidths = {2f, 2f, 2f, 2f};
        PdfPTable table = new PdfPTable(columnWidths);
        table.setWidthPercentage(100f);

        List<String> headers = List.of("Päivämäärä", "Alkanut", "Päättynyt", "Tunnit yhteensä");
        addTableHeaders(table, headers, boldFont);

        addTableRows(table, entries);

        document.add(table);
    }

    private void addTableHeaders(PdfPTable table, List<String> headers, Font boldFont) {
        headers.forEach(header -> {
            PdfPCell cell = new PdfPCell(new Phrase(header, boldFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPaddingTop(5f);
            cell.setPaddingBottom(5f);
            table.addCell(cell);
        });
    }

    private void addTableRows(PdfPTable table, List<TimeEntry> entries) {
        entries.forEach(entry -> {
            table.addCell(createTableCell(dateFormatter.format(entry.getDate())));
            table.addCell(createTableCell(timeFormatter.format(entry.getStartTime())));
            table.addCell(createTableCell(timeFormatter.format(entry.getEndTime())));
            table.addCell(createTableCell(calculateTotalHours(entry)));
        });
    }

    private String calculateTotalHours(TimeEntry entry) {
        Duration duration = Duration.between(entry.getStartTime(), entry.getEndTime());
        long hours = duration.toHours();
        long minutes = duration.toMinutes() % 60;
        if (minutes == 0) return hours + " h";
        else return hours + " h " + minutes + " min";
    }

    private PdfPCell createTableCell(String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPaddingTop(5f);
        cell.setPaddingBottom(5f);
        return cell;
    }

    private void addMonthNameParagraph(Document document, int year, int month, int split, List<TimeEntry> entries) throws DocumentException {
        // Get the month name in Finnish
        Month monthEnum = Month.of(month);
        String monthName = monthEnum.getDisplayName(TextStyle.FULL, Locale.forLanguageTag("fi"));

        // Capitalize the first letter of the month name
        monthName = monthName.substring(0, 1).toUpperCase() + monthName.substring(1);

        // Sum hours and minutes
        long totalMinutes = entries.stream()
                .mapToLong(entry -> Duration.between(entry.getStartTime(), entry.getEndTime()).toMinutes())
                .sum();
        long totalHours = totalMinutes / 60;
        long remainingMinutes = totalMinutes % 60;

        // Count the number of entries (working days)
        int workDays = entries.size();

        // Format the date range
        String dateRange = split == 1 ? "1." + month + " - 15." + month : "16." + month + " - " + YearMonth.of(year, month).lengthOfMonth() + "." + month;

        // Create a paragraph for the date range and month name
        String monthTitleText = year + " " + monthName + " " + dateRange;
        Paragraph monthTitle = new Paragraph(monthTitleText, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14f));
        monthTitle.setSpacingAfter(10f);

        // Create a paragraph for the total hours and minutes
        String totalText;
        if (remainingMinutes == 0) {
            totalText = "Yhteensä: " + totalHours + " h";
        } else {
            totalText = "Yhteensä: " + totalHours + " h " + remainingMinutes + " min";
        }
        Paragraph totalParagraph = new Paragraph(totalText, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12f));
        totalParagraph.setSpacingAfter(10f);

        // Create a paragraph for the number of workdays
        String workDaysText = "Työpäivät: " + workDays + " kpl";
        Paragraph workDaysParagraph = new Paragraph(workDaysText, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12f));
        workDaysParagraph.setSpacingAfter(10f);

        // Add all paragraphs to the document
        document.add(monthTitle);
        document.add(totalParagraph);
        document.add(workDaysParagraph);
    }
}