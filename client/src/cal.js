import React, { useState } from 'react';
import { EventStore, ResourceStore, FilePicker, Toast, Button, Popup, Combo } from '@bryntum/calendar';
import { BryntumCalendar } from '@bryntum/calendar-react';
import ical from 'ical.js';
import { saveAs } from 'file-saver';


const Calendar = ({ events, resources, user }) => {
  const eventStore = new EventStore({ data: events });
  const resourceStore = new ResourceStore({ data: resources });

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
  
  const fileField = new FilePicker({
    fileFieldConfig : {
      multiple : true,
      accept : '.ics'
    },
    buttonConfig : {
      cls  : 'b-blue',
      text: '',
      icon : 'b-fa b-fa-upload',
      weight : 200
    },
    onChange: async function(userId) {
      const file = this.files[0];
      await file.text().then(function(fileContent) {
        console.log(fileContent);
        console.log(ical.parse(fileContent));
        const iCalComponent = new ical.Component(ical.parse(fileContent));
        console.log(iCalComponent);
        const subcomponents = iCalComponent.getAllSubcomponents();
        const events = []
        for (const sub of subcomponents) {
          const event = new ical.Event(sub);
          console.log(event);
          events.push({
            startDate: event.startDate.toString(),
            endDate: event.endDate.toString(),
            name: event.summary,
            recurrenceRule: event.rrule,
            id: event.uid
          });
        }
        console.log(eventStore);
        console.log(events);
        eventStore.add(events);
        Toast.show('Upload Success');
      }).catch((error) => {
        console.error(error);
        Toast.show('Invalid file type');
        
      });
      
    }
  });


  const sidebar = {
    items: {
      datePicker : {
        tbar : {
          items: {
            prevYear : false,
            nextYear : false
          }
        }
      },
    
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
        onClick  : function(e) {
          const popup = new Popup({
              header      : 'Edit Resources',
              autoShow    : false,
              centered    : true,
              closable    : true,
              closeAction : 'destroy',
              width       : '20em',
              minHeight   : '18em',
              bbar        : {
                  items : {
                      cancel : {
                          text     : 'Cancel',
                          minWidth : 100,
                          onAction : 'up.close'
                      },
                      close : {
                          text     : 'OK',
                          minWidth : 100,
                          cls      : 'b-raised b-blue',
                          onAction : () => {
                            // selectedResource.setName(popup.widgetMap.nameField.value);
                            // selectedResource.setColor(popup.widgetMap.colorField.value);
                            // resourceStore.sync(); // Save changes to server (if applicable)
                            // Toast.show("Resource updated successfully.");
                            // popup.close();
                          }
                      }
                  }
              },
              items : {
                  combo : {
                    label : 'Select a Resource',
                    type : 'combo',
                    store : resourceStore,
                    displayField : 'name',
                  },
                  textField : {
                    text : 'resource name',
                  },
                  colorField : {
                    field : 'color',
                  }
              }
          });
          popup.show();
      }
      }
    }
  };
  

  return (
    <BryntumCalendar
      resourceStore={resourceStore}
      eventStore={eventStore}
      sidebar={sidebar}
      tbar={{
        items : {
          fileField,
          exportButton : {
            type: 'button',
            icon: 'b-fa b-fa-download',
            cls: 'b-blue',
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
