import React, { useState } from 'react';
import { EventStore, ResourceStore, FilePicker, Sidebar, Toast } from '@bryntum/calendar';
import { BryntumCalendar } from '@bryntum/calendar-react';
import ical from 'ical.js';
import { saveAs } from 'file-saver';


const Calendar = ({ events, resources, user }) => {
  const [eventStore, setEventStore] = useState(new EventStore({
    data: events,
  }));
  const [resourceStore, setResourceStore] = useState(new ResourceStore({
    data: resources,
  }));

  const downloadICS = () => {
    var comp = new ical.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', 'SE300 Calendar');
    comp.updatePropertyWithValue('version', "2.0");

    for (const record of eventStore.records) {
    const vevent = new ical.Component('vevent');
    const event = new ical.Event(vevent);
    
    event.startDate = new ical.Time.fromJSDate(record.startDate); 
    event.endDate = new ical.Time.fromJSDate(record.endDate);
    event.summary = record.name;
    event.uid = record.id;

    vevent.addPropertyWithValue('DTSTAMP', new ical.Time.now());
    if (record.recurrenceRule) {
      vevent.addPropertyWithValue('RRULE', record.recurrenceRule);
    }
    comp.addSubcomponent(vevent);
    }
    console.log(comp.toString());
    const icsString = comp.toString();
    const blob = new Blob([icsString], { type: 'text/calendar' });
    window.URL.createObjectURL(blob);
    saveAs(blob, 'events.ics');
  }

  function handleChange(records) {
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
  }

  eventStore.on('add', function({ records }) {
    handleChange(records);
  });
  eventStore.on('remove', function({ records }) {
    handleChange(records);
  });
  eventStore.on('update', function({ records }) {
    handleChange(records);
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

  // const sidebar = {
  //   items : {
  //     addCalendarButton : {
  //       type : 'button',
  //       icon : 'b-fa b-fa-calendar-plus',
  //       text : 'Add Calendar',
  //       weight : 200,
  //     },
  //     editResourcesButton : {
  //       type: 'button',
  //       icon: 'b-fa b-fa-edit',
  //       text: 'Edit Resources',
  //       weight: 200,
  //       // onClick: resourceEdit(dummyRecord),
  //     }
  //   }
  // }

  let fileField = new FilePicker({
    fileFieldConfig : {
      multiple : true,
      accept : '.ics'
    },
    buttonConfig : {
      text : 'Add Calendar(s)',
      cls  : 'b-blue b-raised',
      icon : 'b-fa b-fa-calendar-plus',
      style: 'margin-right: .5em',
      weight : 200
    },
    onChange: async function(userId) {
      const file = this.files[0];
      const formData = new FormData();
      formData.append('file', file);

      // const response = await fetch (`/api/endpoint/${userId}`, {
      //   method: 'POST',
      //   body: formData
      // });

      // if (response.ok) {
      //   console.log('File uploaded successfully');
      //   Toast.show('File uploaded successfully');
      // } else {
      //   console.error('File upload failed');
      //   Toast.show('File upload failed');
      // }
    }
  });

  return (
    <BryntumCalendar
      resourceStore={resourceStore}
      eventStore={eventStore}
      // sidebar={{
      //   items : {
      //     fileField
      //   }
      // }}
      tbar={{
        items : {
          exportButton : {
            type  : 'button',
            text  : 'Export Events',
            icon  : 'b-fa b-fa-file-export',
            cls   : 'b-blue b-raised',
            onAction() {
             downloadICS();
            }
          }
        }
      }}
    />
  );
};

export default Calendar;
