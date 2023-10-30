import * as FirebaseApp from "firebase/app";
import * as Database from "firebase/database";
import express from "express"

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
 app.put

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
const application = FirebaseApp.initializeApp(firebaseConfig);
const data = Database.getDatabase(application);
//firebase.push(firebase.ref(data), "Hello")