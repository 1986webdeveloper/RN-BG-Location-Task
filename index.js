/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from "react-native-background-fetch";
import BackgroundGeolocation from "./src/react-native-background-geolocation";

import config from "./src/config";

import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from './aws-exports';
import { createLocation } from './src/graphql/mutations';

API.configure(awsconfig);

global.BackgroundGeolocation = BackgroundGeolocation;

AppRegistry.registerComponent(appName, () => App);

let BackgroundGeolocationHeadlessTask = async (event) => {
    switch (event.name) {
        case 'heartbeat':
            var username = await AsyncStorage.getItem(config.USERNAME_KEY);
            if (username !== null) {
                username = username.toLowerCase();
                var location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'bg-location' } });
                var locationData = {
                    id: (new Date().getTime()).toString(36),
                    createdAt: new Date(),
                    username: username,
                    location: JSON.stringify(location)
                };

                await API.graphql(graphqlOperation(createLocation, { input: locationData }));
            }
            break;
    }
}
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);

let BackgroundFetchLocation = async () => {
    var username = await AsyncStorage.getItem(config.USERNAME_KEY);
    if (username !== null) {
        username = username.toLowerCase();
        var location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'bf-location' } });
        var locationData = {
            id: (new Date().getTime()).toString(36),
            createdAt: new Date(),
            username: username,
            location: JSON.stringify(location)
        };

        await API.graphql(graphqlOperation(createLocation, { input: locationData }));
    }
    BackgroundFetch.finish();
}
BackgroundFetch.registerHeadlessTask(BackgroundFetchLocation);