/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from "react-native-background-fetch";
import BackgroundGeolocation from "./src/react-native-background-geolocation";

global.BackgroundGeolocation = BackgroundGeolocation;

AppRegistry.registerComponent(appName, () => App);

let BackgroundGeolocationHeadlessTask = async (event) => {
    switch (event.name) {
        case 'heartbeat':
            var location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'bg-index-position' } });
            var endpoint_url = await AsyncStorage.getItem('_endpoint_url');
            if (endpoint_url !== null) {
                await fetch(endpoint_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(location),
                });
            }
            break;
    }
}

BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);

let BackgroundFetchLocation = async () => {
    var location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'index-position' } });
    var endpoint_url = await AsyncStorage.getItem('_endpoint_url');
    if (endpoint_url !== null) {
        BackgroundFetch.c
        await fetch(endpoint_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(location),
        });
    }
    BackgroundFetch.finish();
}
BackgroundFetch.registerHeadlessTask(BackgroundFetchLocation);