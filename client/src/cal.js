import React, { useState } from 'react';
import { EventStore, ResourceStore } from '@bryntum/calendar';
import { BryntumCalendar } from '@bryntum/calendar-react';
import '@bryntum/calendar/calendar.classic.css';

const Calendar = ({ events }) => {
  const [eventStore, setEventStore] = useState(new EventStore({
    data: events,
  }));

  eventStore.on('add', function({records}) {
    console.log(records.map(record => record.data));
    console.log('All events:', eventStore.records.map(record => record.data));
  })

  return (
    <BryntumCalendar
      eventStore={eventStore}
    />
  );
};

export default Calendar;
