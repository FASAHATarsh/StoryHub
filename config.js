import * as firebase from 'firebase';
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyDcAjBkVfAr6lyJuo7VUXxKPa-iSzRF5gM",
    authDomain: "willy-bfd09.firebaseapp.com",
    projectId: "willy-bfd09",
    storageBucket: "willy-bfd09.appspot.com",
    messagingSenderId: "904391065790",
    appId: "1:904391065790:web:4726c8da54036585ecdeef"
  };
  // Initialize Firebase
 
 if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
 }

 export default firebase.firestore();