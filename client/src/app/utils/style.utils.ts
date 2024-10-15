import { TimeEntry } from '../src/app/features/time-entry-form/time-entry.model';

export const getDateStyle = (date: any, selectedDate: Date, timeEntries: TimeEntry[]): Record<string, string> => {
  const current = new Date(date.year, date.month, date.day);

  const matchingEntry = timeEntries.find((entry: TimeEntry) => {
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

  if (matchingEntry) {
    const startTime = new Date(`1970-01-01T${matchingEntry.startTime}`);
    const endTime = new Date(`1970-01-01T${matchingEntry.endTime}`);
    let totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    if (matchingEntry.hasLunch) {
      totalMinutes -= 30;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours !== 7 || minutes !== 30) {
      finalStyle = {
        ...finalStyle,
        'background-color': 'red',
        'color': 'white',
        'font-weight': 'bold',
      };
    } else {
      finalStyle = {
        ...finalStyle,
        'background-color': '#007bff',
        'color': 'white',
        'font-weight': 'bold',
      };
    }
  }

  if (isSelectedDate) {
    finalStyle = {
      ...finalStyle,
      'border': '4px solid #000',
    };
  }

  return finalStyle;
};
