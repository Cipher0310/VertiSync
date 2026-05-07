// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBTpBJeYEnM-UbTdciFVPGXPJSLZcgrpUk",
    authDomain: "utm-vertical-farm.firebaseapp.com",
    databaseURL: "https://utm-vertical-farm-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "utm-vertical-farm",
    storageBucket: "utm-vertical-farm.firebasestorage.app",
    messagingSenderId: "483224491382",
    appId: "1:483224491382:web:c20e58732d3a7671ff1657"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
