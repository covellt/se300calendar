import React, { useState } from 'react';
import { EventStore, ResourceStore, FilePicker, Toast, Popup } from '@bryntum/calendar';
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

  function handleEventChange() {
    const repackagedData = {};
    for (const event of eventStore.records) {
      const eventData = Object.assign({}, event.data);
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

  eventStore.on('add', function() {
    handleEventChange();
  });
  eventStore.on('remove', function() {
    handleEventChange();
  });
  eventStore.on('update', function() {
    handleEventChange();
  });

  function handleResourceChange() {
    if (user) {
      const repackagedData = {};
      for (const resource of resourceStore.records) {
        const resourceData = Object.assign({}, resource.data);
        const resourceId = resourceData.id;
        repackagedData[resourceId] = resourceData;
        delete repackagedData[resourceId].id;
      }
      fetch(`/api/write/${user}/resources`, {
        method: 'POST',
        body: JSON.stringify(repackagedData),
        cache: 'no-cache',})
    }
  }

  resourceStore.on('add', function () {
    handleResourceChange();
  });
  resourceStore.on('remove', function () {
    handleResourceChange();
  });
  resourceStore.on('update', function () {
    handleResourceChange();
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
        onClick  : function(e) {
          const popup = new Popup({
              header      : 'Add Resource',
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
                            const newRecord = {
                              eventColor: popup.widgetMap.colorField.value,
                              name: popup.widgetMap.nameField.value,
                            }
                            resourceStore.add(newRecord);
                            console.log(resourceStore);
                            console.log(eventStore);
                            popup.close();
                          }
                      }
                  }
              },
              items : [
                  {
                    label: "Name",
                    type: "textfield",
                    ref: "nameField",
                  },
                  {
                    label: "Color",
                    type: "colorField",
                    ref: "colorField",
                  },
                ],
          });
          popup.show();
      }
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
                    delete: {
                      text: "Delete",
                      minWidth: 100,
                      cls: "b-raised b-red",
                      onAction: () => {
                        const selectedResource = popup.widgetMap.combo.record;
                        if (!selectedResource) {
                          Toast.show("Please select a resource to delete.");
                          return;
                        }

                        resourceStore.remove(selectedResource);
                        Toast.show("Resource deleted successfully.");
                        popup.close();
                      },
                    },
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
                            const selectedResource = popup.widgetMap.combo.record;
                            if (selectedResource) {
                              resourceStore.getById(selectedResource.id).set({
                                eventColor: popup.widgetMap.colorField.value,
                                name: popup.widgetMap.nameField.value,
                              });
                              console.log(selectedResource);
                              console.log(resourceStore);
                              Toast.show('saved');
                            }
                            popup.close();
                          }
                      }
                  }
              },
              items : [
                  {
                    label : 'Select a Resource',
                    type : 'combo',
                    ref : 'combo',
                    store : resourceStore,
                    displayField : 'name',
                    listeners: {
                      // Update text and color fields when selection changes
                      change: () => {
                        const selectedResource = popup.widgetMap.combo.record;
                        popup.widgetMap.nameField.hidden = !selectedResource;
                        popup.widgetMap.colorField.hidden = !selectedResource;
                        if (!selectedResource) {
                          popup.widgetMap.nameField.setValue("empty");
                          popup.widgetMap.colorField.setValue("");
                        } else {
                          popup.widgetMap.nameField.setValue(selectedResource.name);
                          popup.widgetMap.colorField.setValue(selectedResource.eventColor);
                        }
                      },
                    },
                  },
                  {
                    label: "Name",
                    type: "textfield",
                    ref: "nameField",
                    hidden: true,
                  },
                  {
                    label: "Color",
                    type: "colorField",
                    ref: "colorField",
                    hidden: true,
                  },
                ],
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
