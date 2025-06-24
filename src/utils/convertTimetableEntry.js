export function convertTimetableEntry(entry, referenceMonday = "2025-06-09") {
  const dayOffset = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  const offset = dayOffset[entry.day];
  if (offset === undefined) return null;

  const baseDate = new Date(referenceMonday);
  baseDate.setDate(baseDate.getDate() + offset);

  const formatDateTime = (date, time) => {
    return `${date.toISOString().split("T")[0]}T${time}`;
  };

  return {
    id: entry.id,
    title: `${entry.course_code} (${entry.lecturer}, ${entry.classroom})`,
    start: formatDateTime(baseDate, entry.start_time),
    end: formatDateTime(baseDate, entry.end_time),
    daysOfWeek: [offset + 1], // FullCalendar: Monday = 1
    startTime: entry.start_time,
    endTime: entry.end_time,
    extendedProps: {
      lecturer: entry.lecturer,
      classroom: entry.classroom,
      course: entry.course_code,
    },
  };
}
