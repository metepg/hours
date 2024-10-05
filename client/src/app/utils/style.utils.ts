import { TimeEntry } from '../src/app/features/time-entry-form/time-entry.model';

export const getDateStyle = (date: any, selectedDate: Date, timeEntries: TimeEntry[]): Record<string, string> => {
  const current = new Date(date.year, date.month, date.day);

  const isDatePresent = timeEntries.some((entry: TimeEntry) => {
    const entryMonthDay = new Date(entry.date);
    return (
      entryMonthDay.getMonth() === current.getMonth() &&
      entryMonthDay.getDate() === current.getDate()
    );
  });

  // Check if the current date is the selected date
  const isSelectedDate = (
    current.getDate() === selectedDate.getDate() &&
    current.getMonth() === selectedDate.getMonth() &&
    current.getFullYear() === selectedDate.getFullYear()
  );

  const baseStyle: Record<string, string> = {
    'width': '35px',
    'height': '35px',
    'border-radius': '50%',
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'font-size': '14px',
  };

  // Style if the date has an entry
  let finalStyle = { ...baseStyle };

  if (isDatePresent) {
    finalStyle = {
      ...finalStyle,
      'background-color': '#007bff', // Background color for dates with entries
      'color': 'white',
      'font-weight': 'bold',
    };
  }

  // Apply the border if the date is the selected date, without overwriting existing styles
  if (isSelectedDate) {
    finalStyle = {
      ...finalStyle,
      'border': '4px solid #000',
    };
  }

  return finalStyle;
};
