import { TimeEntry } from '../src/app/features/time-entry-form/time-entry.model';

export const getDateStyle = (date: any, selectedDate: Date | null, timeEntries: TimeEntry[]): Record<string, string> => {
  const current = new Date(date.year, date.month, date.day);

  const matchingEntry = timeEntries.find((entry: TimeEntry) => {
    const date = new Date(entry.date);
    return (
      date.getFullYear() === current.getFullYear() &&
      date.getMonth() === current.getMonth() &&
      date.getDate() === current.getDate()
    );
  });

  const isSelectedDate =
    !!selectedDate &&
    current.getDate() === selectedDate.getDate() &&
    current.getMonth() === selectedDate.getMonth() &&
    current.getFullYear() === selectedDate.getFullYear();

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

    if (totalMinutes > 450) {
       // more than 7h30 = GREEN
      finalStyle = {
        ...finalStyle,
        'background-color': 'green',
        'color': 'white',
        'font-weight': 'bold',
      };
    } else if (totalMinutes < 450) {
       // less than 7h30 = RED
      finalStyle = {
        ...finalStyle,
        'background-color': 'red',
        'color': 'white',
        'font-weight': 'bold',
      };
    } else {
      // exactly 7h30 = BLUE
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
