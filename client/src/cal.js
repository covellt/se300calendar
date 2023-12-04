import React, { useState } from 'react';
import { EventStore, ResourceStore, FilePicker, Sidebar, Toast } from '@bryntum/calendar';
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

      const response = await fetch (`/api/endpoint/${userId}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('File uploaded successfully');
        Toast.show('File uploaded successfully');
      } else {
        console.error('File upload failed');
        Toast.show('File upload failed');
      }
    }
  });

  return (
    <BryntumCalendar
      resourceStores={resourceStore}
      eventStore={eventStore}
      sidebar={{
        items : {
          fileField
        }
      }}
      tbar={{
        items : {
          exportButton : {
            type  : 'button',
            text  : 'Export Events',
            icon  : 'b-fa b-fa-file-export',
            cls   : 'b-blue b-raised',
            onAction() {
              eventStore.export({
                type : 'calendar',
              });
            }
          }
        }
      }}
    />
  );
};

export default Calendar;
