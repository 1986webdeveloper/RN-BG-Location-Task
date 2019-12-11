import React, { Fragment, Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
  TextInput,
  Picker
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import BackgroundGeolocation from "react-native-background-geolocation";
import BackgroundFetch from "react-native-background-fetch";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frequency: "15",
      endpoint_url: "",
    }
  }

  async componentDidMount() {
    await this.loadSettings();
    this.configureBackgroundFetch();
  }

  configureBackgroundFetch() {
    var _self = this;
    BackgroundFetch.stop();

    var frequency = this.state.frequency;

    BackgroundFetch.configure({
      minimumFetchInterval: (frequency * 1),
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiresCharging: false,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      requiresDeviceIdle: false,
      requiresBatteryNotLow: false,
      requiresStorageNotLow: false
    }, async () => {
      let location = await BackgroundGeolocation.getCurrentPosition({ extras: { 'context': 'background-position' } });
      _self.sendData(location);
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, (error) => {
      console.log('RNBackgroundFetch failed to start')
    });
  }

  onChangeValue = (type, text) => {
    this.setState({ [type]: text });
  }

  sendData = (data) => {
    var endpoint_url = this.state.endpoint_url;

    if (endpoint_url !== "") {
      fetch(endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }
  }

  saveSettings = async () => {
    var endpoint_url = this.state.endpoint_url;
    var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(endpoint_url)) {
      try {
        alert("Setting save successfully");

        this.configureBackgroundFetch();

        await AsyncStorage.setItem('_frequency', this.state.frequency);
        await AsyncStorage.setItem('_endpoint_url', endpoint_url);

      } catch (error) {
        alert("Please try again later!");
      }
    }
    else {
      alert("Please enter valid endpoint URL.!");
    }
  }


  loadSettings = async () => {
    const frequency = await AsyncStorage.getItem('_frequency');
    if (frequency !== null) {
      this.setState({ frequency });
    }
    const endpoint_url = await AsyncStorage.getItem('_endpoint_url');
    if (endpoint_url !== null) {
      this.setState({ endpoint_url });
    }

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
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

  render() {
    const { frequency, endpoint_url } = this.state;

    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.container}
          >
            <View style={styles.viewHolder}>
              <Text style={styles.titleText}>URL Endpoint :</Text>
              <TextInput
                style={styles.textBox}
                onChangeText={text => this.onChangeValue("endpoint_url", text)}
                value={endpoint_url}
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
                  <Picker.Item label="15 Min" value="15" />
                  <Picker.Item label="30 Min" value="30" />
                  <Picker.Item label="60 Min" value="60" />
                </Picker>
              </View>
            </View>
            <View style={styles.btnStyle}>
              <Button onPress={this.saveSettings} title="Save" />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
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