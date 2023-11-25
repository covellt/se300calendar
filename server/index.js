import * as FirebaseApp from "firebase/app";
import * as Database from "firebase/database";
import express from "express";
import cors from "cors";

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

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

let test = { 
  "success" : true, 
  "events"    : [
      { "id" : 1, 
      "name" : "Batman" }
]}


app.get("/load", (req, res) => {
  res.json(test);
});

app.get("/sync", (req, res) => {
  console.log(req);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
