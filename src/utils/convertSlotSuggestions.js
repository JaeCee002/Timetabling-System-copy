import { v4 as uuidv4 } from 'uuid';

export function convertSuggestedSlots(suggestedSlots, referenceMonday = "2025-06-09") {
  const dayOffset = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  const formatDateTime = (date, time) => {
    return `${date.toISOString().split("T")[0]}T${time}`;
  };

  return suggestedSlots.map((slot, index) => {
    const offset = dayOffset[slot.day];
    if (offset === undefined) return null;

    const baseDate = new Date(referenceMonday);
    baseDate.setDate(baseDate.getDate() + offset);

    return {
      id: `suggested-slot-${uuidv4()}`,
      title: `Available Slot`,
      start: formatDateTime(baseDate, slot.start_time),
      end: formatDateTime(baseDate, slot.end_time),
      daysOfWeek: [offset + 1],
      startTime: slot.start_time,
      endTime: slot.end_time,
      duration: slot.duration,
      extendedProps: {
        type: 'suggested_slot',
        day: slot.day,
        duration: slot.duration,
        isSuggestion: true,
      },
    };
  }).filter(slot => slot !== null);
}