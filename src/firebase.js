import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const config = require('./config/firebaseConfig.json');
firebase.initializeApp(config);

export default firebase;
