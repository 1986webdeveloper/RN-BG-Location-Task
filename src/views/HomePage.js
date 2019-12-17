import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    Picker
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from "react-native-background-fetch";
import BackgroundGeolocation from "./../react-native-background-geolocation";
import config from "./../config";

import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from './../../aws-exports';
import { createLocations } from './../graphql/mutations';

API.configure(awsconfig);

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            frequency: "15",
            username: "",
            endpoint_url: config.SERVER_URL,
            userAuth: false
        }
    }

    async componentDidMount() {
        await this.loadSettings();

        var username = this.state.username;
        if (username !== "") {
            this.configureBackgroundFetch();
        }
    }

    configureBackgroundFetch() {
        var _self = this;
        var frequency = (this.state.frequency) * 1;

        BackgroundFetch.stop();
        BackgroundFetch.configure({
            minimumFetchInterval: frequency,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
            requiresCharging: false,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            requiresDeviceIdle: false,
            requiresBatteryNotLow: false,
            requiresStorageNotLow: false
        }, async () => {
            _self.sendLocationData();
            BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
        }, (error) => {
            console.log('RNBackgroundFetch failed to start')
        });

        BackgroundGeolocation.stop();
        BackgroundGeolocation.ready({
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            heartbeatInterval: (frequency * 60),
            enableHeadless: true,
            distanceFilter: 10,
            enableHeadless: true,
            stopOnTerminate: false,
            startOnBoot: true
        }, (state) => {
            if (!state.enabled) {
                BackgroundGeolocation.start(function () {
                    console.log("- Start success");
                });
            }
        });
    }

    onChangeValue = (type, text) => {
        this.setState({ [type]: text });
    }

    sendLocationData = async () => {
        alert("Location save successfully");
        let location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'force-location' } });
        var username = this.state.username;
        username = username.toLowerCase();
        var locationData = { username: username, location: JSON.stringify(location) };
        if (username !== "") {
            await API.graphql(graphqlOperation(createLocations, { input: locationData }));
        }
    }

    saveSettings = async () => {
        var username = this.state.username;
        if (username !== "") {
            try {
                alert("Setting save successfully");

                this.configureBackgroundFetch();

                await AsyncStorage.setItem(config.FREQUENCY_KEY, this.state.frequency);
                await AsyncStorage.setItem(config.USERNAME_KEY, username);

                this.setState({ userAuth: true });
            } catch (error) {
                alert("Please try again later!");
            }
        }
        else {
            alert("Please enter valid Username.!");
        }
    }


    loadSettings = async () => {
        var frequency = await AsyncStorage.getItem(config.FREQUENCY_KEY);
        if (frequency !== null) {
            this.setState({ frequency });
        }

        var username = await AsyncStorage.getItem(config.USERNAME_KEY);
        if (username !== null) {
            this.setState({ username: username, userAuth: true });
        }
    }

    render() {
        const { frequency, username, userAuth } = this.state;

        return (
            <View style={styles.container} >
                <View style={styles.viewHolder}>
                    <Text style={styles.titleText}>Username :</Text>
                    <TextInput
                        style={styles.textBox}
                        onChangeText={text => this.onChangeValue("username", text)}
                        value={username}
                    />
                </View>

                <View style={styles.viewHolder}>
                    <Text style={styles.titleText}>Frequency of Logging :</Text>
                    <View style={styles.pickerStyle}>
                        <Picker
                            selectedValue={frequency}
                            onValueChange={(itemValue) =>
                                this.onChangeValue("frequency", itemValue)
                            }
                        >
                            <Picker.Item label="1 hour" value="15" />
                            <Picker.Item label="3 hour" value="180" />
                            <Picker.Item label="6 hour" value="360" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.btnStyle}>
                    <Button onPress={this.saveSettings} title="Save Profile" />
                </View>

                {userAuth && (
                    <View style={styles.btnStyle}>
                        <Button color="#ff5c5c" onPress={this.sendLocationData} title="Save Current Location" />
                    </View>
                )}
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
        paddingHorizontal: 10
    },

    viewHolder: {
        marginVertical: 5
    },

    titleText: {
        fontSize: 16,
        fontWeight: "bold",
        paddingVertical: 10,
        color: "gray"
    },

    pickerStyle: {
        height: 50,
        width: 150,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "gray",
        alignContent: "center"
    },

    textBox: {
        height: 50,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10
    },

    btnStyle: {
        height: 50,
        marginVertical: 10
    }
});