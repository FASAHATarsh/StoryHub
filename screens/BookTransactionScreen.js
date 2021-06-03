import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId: '',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState}=this.state
      if(buttonState==='bookID'){
        this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
      }
      else if(buttonState==='studentID'){
        this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
      }
      
    }
    handelTransaction=async()=>{
      var msg
      db.collection("book").doc(this.state.scannedBookId).get()
      .then((doc)=>{
        var book = doc.data()
        if(book.bookAvail)
        {
          this.initiateBookIssue()
          msg="Issued"
        }
        else{
          this.initiateBookReturn()
          msg="Return"
        }
      })
    
    this.setState({
      transMsg:msg
    })
    }
    initiateBookIssue=async()=>{
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':'Issue'
        
      })
      db.collection('book').doc(this.state.scannedBookId).update({
        'bookAvail':false
      })
      db.collection('student').doc(this.state.scannedStudentId).update({
        'noOfBooks':firebase.firestore.FieldValue.increment(1)
      })    
      Alert.alert("Book Issued !")
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
      }

          initiateBookReturn=async()=>{
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':'Return'
        
      })
      db.collection('book').doc(this.state.scannedBookId).update({
        'bookAvail':true
      })
      db.collection('student').doc(this.state.scannedStudentId).update({
        'noOfBooks':firebase.firestore.FieldValue.increment(-1)
      })    
      Alert.alert("Book Returned !")
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
      }


    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
          <View>
          <Image source={require('../assets/booklogo.jpg')}
          style={{
            width:200,
            height:200
          }}
          />
          <Text style={{textAlign:'center', fontSize:30}}>Willy</Text>
          </View>
          <View style={styles.inputView}>
          <TextInput placeholder='Book ID' style={styles.inputBox} 
          value={this.state.scannedBookId}
          />
          <TouchableOpacity style={styles.scanButton}
          onPress={()=>{
            this.getCameraPermissions('bookID')
          }}
          >
          <Text style={styles.buttonText}>
          Scan
          </Text>
          </TouchableOpacity>
          </View >
            <View style={styles.inputView}>



          <TextInput placeholder='Student ID' style={styles.inputBox}
                    value={this.state.scannedStudentId}

          />
          <TouchableOpacity style={styles.scanButton}
          onPress={()=>{
            this.getCameraPermissions('studentID')
          }}
          >
          <Text style={styles.buttonText}>
          Scan
          </Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={async()=>{this.handelTransaction()}}>
          <Text style={styles.submitText}>
          Submit
          </Text>
          </TouchableOpacity>

        </View>

        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 0,
      margin: 0,
      width:50,
      borderWidth: 1.5,
    },
    buttonText:{
      fontSize: 20,
      textAlign: 'center',
      marginTop: 10,

    },
    inputView:{
      flexDirection:'row',
      margin: 20,

    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize:20,
    },
    submitButton:{
      backgroundColor:'blue',
      width: 100,
      height: 50,
      borderRadius:15
    },
    submitText:{
      padding:10,
      textAlign:"center",
      fontSize:20,
      fontWeight:'bold',
      color:'white'
    }

    

  });