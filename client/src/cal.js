import React, { useState } from 'react';
import { EventStore, ResourceStore } from '@bryntum/calendar';
import { BryntumCalendar } from '@bryntum/calendar-react';
import '@bryntum/calendar/calendar.classic.css';


const Calendar = ({ events, resources, user }) => {
  const [eventStore, setEventStore] = useState(new EventStore({
    data: events,
  }));
  const [resourceStore, setResourceStore] = useState(new ResourceStore({
    data: resources,
  }));

  eventStore.on('change', function ({ records }) {
    // console.log(records.map((record) => record.data));
    // console.log('All events:', eventStore.records.map((record) => record.data));
    // console.log(eventStore.json);
    const repackagedData = {};
    for (const event of eventStore.records) {
      const eventData = Object.assign({}, event.data);
      // console.log(eventData);
      const eventId = eventData.id;
      repackagedData[eventId] = eventData;
      delete repackagedData[eventId].id;
    }
    console.log("data sent to backend: " + JSON.stringify(repackagedData));

    if (user) {
      fetch(`/api/write/${user}/events`, {
        method: 'POST',
        body: JSON.stringify(repackagedData),
        cache: 'no-cache',})
    }
  });

  resourceStore.on('change', function ({ records }) {
    console.log(records.map((record) => record.data));
    console.log('All resources:', resourceStore.records.map((record) => record.data));
    if (user) {
      fetch(`/api/write/${user}/resources`, {
        method: 'POST',
        body: resourceStore.json,
        cache: 'no-cache',})
    }
  });

  const sidebar = {
    items : {
      addCalendarButton : {
        type : 'button',
        icon : 'b-fa b-fa-calendar-plus',
        text : 'Add Calendar',
        weight : 200,
      },
      editResourcesButton : {
        type: 'button',
        icon: 'b-fa b-fa-edit',
        text: 'Edit Resources',
        weight: 200,
        // onClick: resourceEdit(dummyRecord),
      }
    }
  }

  return (
    <BryntumCalendar
      eventStore={eventStore}
      resourceStore={resourceStore}
      sidebar={sidebar}
    />
  );
};

export default Calendar;
