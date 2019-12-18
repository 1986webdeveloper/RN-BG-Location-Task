import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator, 
    Text
} from 'react-native';


import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from './../../aws-exports';
import { listLocations } from './../graphql/queries';

import AsyncStorage from '@react-native-community/async-storage';
import config from "./../config";

API.configure(awsconfig);

export default class ListLocations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoad: false,
            dataLoading: true,
            index: 0,
            locations: []
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.index !== state.index) {
            return {
                isLoad: false,
                index: props.index
            }
        }

        return null;
    }

    async componentDidUpdate() {
        if (this.state.index === 1 && !this.state.isLoad) {
            this.setState({ isLoad: true });
            var username = await AsyncStorage.getItem(config.USERNAME_KEY);
            if (username !== null) {
                this.setState({ dataLoading: true });
                const allLocations = await API.graphql(graphqlOperation(listLocations, {
                    filter: {
                        username: {
                            eq: username.toLowerCase()
                        }
                    },
                    limit: 1000
                }));
                if (allLocations.data.listLocations.items) {

                    var userLocations = allLocations.data.listLocations.items;
                    userLocations.sort(function (x, y) {
                      var a= new Date(x.createdAt), b = new Date(y.createdAt);
                      if (a > b) return -1;
                      if (a < b) return 1;
                      return 0;
                    })
              
                    this.setState({ locations: userLocations });
                }
                this.setState({ dataLoading: false });
            }
        }
    }

    formatDate(date) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        var hour = date.getHours();
        var minute = date.getMinutes();
        if (minute < 10) { 
            minute = "0" + minute;
        }
        var ampm = "AM";
        if (hour > 12) {
            hour -= 12;
            ampm = "PM";
        }

        return day + ' ' + monthNames[monthIndex] + ', ' + year + ' ' + hour + ':' + minute + ' ' + ampm;
    }


    render() {
        const { locations, dataLoading } = this.state;
        return (
            <View style={styles.container} >
                {
                    dataLoading ? (
                        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
                    ) : (
                            locations.length > 0 ? (
                                locations && locations.map((item, index) => {
                                    var location = JSON.parse(item.location);
                                    return (
                                        <View style={styles.boxItem} key={index}>
                                            <Text>Date: {this.formatDate(new Date(location.timestamp))}</Text>
                                            <Text>Latitude: {location.coords.latitude}</Text>
                                            <Text>Longitude: {location.coords.longitude}</Text>
                                        </View>
                                    )
                                })
                            )
                                :
                                <Text style={styles.textStyle1}>No Locations found!</Text>

                        )
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
        paddingHorizontal: 10
    },
    loader:{
        marginTop: 30
    },
    textStyle1:{
        textAlign: "center",
        marginTop: 30,
        fontSize: 22
    },  
    boxItem: {
        padding: 15,
        marginVertical: 15,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#A5A5A5"
    }
});