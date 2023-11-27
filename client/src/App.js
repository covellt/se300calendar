import React, { createContext, useState, useEffect } from 'react';
import './index.css';
import reportWebVitals from './reportWebVitals.js';
import Calendar from './cal.js';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const UserContext = createContext();

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Firebase.
  const config = {
    apiKey: "AIzaSyDXpg8capdPLMxvhOTIQe5Gk_4MoLM0Auw",
    authDomain: "se300-calendar.firebaseapp.com",
    projectId: "se300-calendar",
    storageBucket: "se300-calendar.appspot.com",
    messagingSenderId: "495446267648",
    appId: "1:495446267648:web:fcdc21cf2ae117c068c5e5",
    measurementId: "G-44RE8CBD65"
  };
  firebase.initializeApp(config);

  // Configure FirebaseUI.
  const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
  };

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async user => {
      setIsSignedIn(!!user);
      if (user) {
        fetch(`/api/endpoint/${user.uid}`, {cache: 'no-cache',})
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            } return response.json();
          })
          .then(fetchedData => {
            console.log('Raw data from backend:', fetchedData);
            setEvents(Object.keys(fetchedData.events).map(eventId => ({...fetchedData.events[eventId], eventId})))
            setLoading(false);
          })
          .catch(error => console.error(error));
      } else {console.log("no user");}
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  useEffect(() => {
    console.log(events);
  }, [events]);
  


  return(
    <UserContext.Provider value={events}>

      {!isSignedIn ? (
        <div>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
      ) : (
        loading ? <div>Loading...</div> : <Calendar events={events} />
      )}

    </UserContext.Provider>
  );
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
