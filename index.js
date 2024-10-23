
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';


AppRegistry.registerComponent(appName, () => App);