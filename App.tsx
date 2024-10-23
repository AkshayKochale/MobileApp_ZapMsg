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

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) { // Android 13 (API 33)
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

function initPushNotifications() {
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

const App = () => {


  useEffect(() => {
    // Request notification permission on Android 13+
    requestNotificationPermission();

    // Initialize push notifications
    initPushNotifications();
  }, []);



  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

     

  const showNotification = () => {
    PushNotification.localNotification({
      title: "Goku",
      message: "Is the Final Boss!!",
      playSound: true,
      soundName: 'default',
      channelId:'zapmsg-channel'
    });
    console.log("show noti called !!");
  };

  const handleLogin = async () => {
    try {
      
      showNotification();
    } catch (error) {
      Alert.alert('Login Failed', "Try Valid Username and Password");
    }
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
            style={styles.inputBox}
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.inputBox}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />

          <TouchableOpacity onPress={handleLogin} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Login</Text>
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
});

export default App;
