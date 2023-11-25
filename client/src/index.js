import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import SignInScreen from './ui.js';
import Calendar from './cal.js';
import Fileinput from './fileinput.js';


let data = {
  "events": {
    "event1": {
      "resourceId": "r1",
      "name": "Event 1",
      "startDate": "2023-12-01T10:00:00",
      "endDate": "2023-12-01T11:00:00"
    },
    "event2": {
      "resourceId": "r2",
      "name": "Event 2",
      "startDate": "2023-12-02T14:00:00",
      "endDate": "2023-12-02T15:00:00"
    }
  }
}

let events = Object.keys(data.events).map(eventId => ({...data.events[eventId], eventId}));
console.log(events);

const cal = ReactDOM.createRoot(document.getElementById('mainbox'));
cal.render(
  
  <Calendar
  events={events}
  />
  

)

const loginButton = ReactDOM.createRoot(document.getElementById('signupbutton'));
loginButton.render(
  <SignInScreen
 />
)


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
