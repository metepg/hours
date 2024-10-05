package com.metepg.hours.service;

public interface DocumentService {
   byte[] generatePDF(int year, int month, int split);
}
