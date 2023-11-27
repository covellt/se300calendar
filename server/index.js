import express from "express";
import admin from "firebase-admin";
import serviceAccount from './se300-calendar-firebase-adminsdk-g9y5y-7b8763cddf.json' assert { type: 'json' };

const app = express();
const PORT = process.env.PORT || 3001;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXpg8capdPLMxvhOTIQe5Gk_4MoLM0Auw",
  authDomain: "se300-calendar.firebaseapp.com",
  projectId: "se300-calendar",
  storageBucket: "se300-calendar.appspot.com",
  messagingSenderId: "495446267648",
  appId: "1:495446267648:web:fcdc21cf2ae117c068c5e5",
  measurementId: "G-44RE8CBD65"
};

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://se300-calendar-default-rtdb.firebaseio.com'
})

const db = admin.database();

app.get('/api/endpoint/:userid', (req, res) => {
  const userId = req.params.userid;
  const ref = db.ref(`users/${userId}`);

  ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No user data found');
    }
  }, (error) => {
    console.error('Error getting data:', error);
    res.status(500).send('Error getting data');
  });
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
