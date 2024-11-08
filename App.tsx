import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) { 
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied");
      }
    } catch (err) {
      console.warn("Error requesting notification permission", err);
    }
  }
}

function initPushNotifications() 
{
  PushNotification.createChannel(
    {
      channelId: "zapmsg-channel",
      channelName: "ZapMsg Notifications",
      channelDescription: "Notifications for ZapMsg app",
      playSound: true,
      vibrate: true,
      importance: 4,
      soundName: "default",
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );

  PushNotification.configure({
    onNotification: function (notification) {
      console.log("Notification received:", notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });
}


// WebSocket setup function
const initWebSocket = (userId:string) => 
  {
    console.log('WebSocket connection started'); 
    const ws = new WebSocket(`ws://192.168.0.101:8182/notifications?userId=${userId}`);
    ws.onopen = () => {
      // Connection opened
      console.log('WebSocket connection opened');
      ws.send('Hello, server!'); 
    };
   
    ws.onmessage = (e: any) => {
      try {
          // Parse the JSON data
          const data = JSON.parse(e.data);
  
          // Extract the title and content from the message
          const msgTitle = data.msgtitle;
          const msgContent = data.msgcontent;
  
          // Pass the extracted data to showNotification
          showNotification(msgTitle, msgContent);
  
          // Log the received message
          console.log(`This is from onmsg: ${msgTitle} : ${msgContent}`);
      } catch (error) {
          console.error("Error parsing WebSocket message", error);
      }
  };

    ws.onerror = (e:any) => {
      // An error occurred
      console.log(e)
      console.log(e.message);
    };
    ws.onclose = (e:any) => {
      // Connection closed
      console.log(e.code, e.reason);
    };
  
  };


// Function to trigger local notification
function showNotification(title: string, message: string){
  PushNotification.localNotification({
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    channelId: 'zapmsg-channel'
  });
  console.log("Notification shown:", title, message);
}

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVisible, setisVisible] = useState(true);
  const [nameFromStorage, setnameFromStorage] = useState<string | null>(null);

  useEffect(() => {
    // Request notification permission on Android 13+
    requestNotificationPermission();

    // Initialize push notifications
    initPushNotifications();

  }, []);

  const nameFromStorageFunction=async()=>{
    let name= await AsyncStorage.getItem('username');
    setnameFromStorage(name);
    return name;
  }

  const handleLogin = async () => {
    try {

      try {
      const response = await axios.post('http://192.168.0.101:8080/login', {
        username: username,
        password: password
        });
        console.log("api hit : "+response.data.status+" : "+response.data.msg);
        // Initialize WebSocket connection
          initWebSocket(username);
      } catch (error: any) {

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
      } else if (error.request) {
          // The request was made but no response was received
          console.error("Request data:", error.request);
      } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
      }
      console.error("Config:", error.config);
      console.error("Full error object:", error);

      }


      if(username === "akshay" && password === "123") {
        await AsyncStorage.setItem('username', "AkshayKochale");
        await AsyncStorage.setItem('password', username);
        setisVisible(false);
        nameFromStorageFunction();
      }
    } catch (error) {
      console.log("outside")
      Alert.alert('Login Failed', "Try Valid Username and Password");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('password');
    setisVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <View style={styles.header}>
            <Image
              style={styles.headerLogo}
              source={require('./assets/thunderIcon.png')}
            />
            <Text style={styles.headerTitle}>ZapMsg</Text>
          </View>

          <TextInput
            style={isVisible ? styles.inputBox : styles.invisible}
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={isVisible ? styles.inputBox : styles.invisible}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />

          <TouchableOpacity onPress={handleLogin} style={isVisible ? styles.submitButton : styles.invisible}>
            <Text style={styles.submitButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={isVisible ? styles.invisible : styles.msg}>{nameFromStorage} waiting for notification....</Text>
          
          <TouchableOpacity onPress={handleLogout} style={isVisible ? styles.invisible : styles.submitButton}>
            <Text style={styles.submitButtonText}>LogOut</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loginBox: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
    height: 60,
  },
  headerLogo: {
    width: 15,
    height: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputBox: {
    borderBottomWidth: 1,
    borderColor: '#97959A',
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#7F4BC1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  invisible: {
    display: 'none',
  },
  msg: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
