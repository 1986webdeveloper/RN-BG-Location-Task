import React, { Fragment, Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  StatusBar,
  Dimensions
} from 'react-native';

import { TabView, SceneMap } from 'react-native-tab-view';

import HomePage from './views/HomePage';
import ListLocations from './views/ListLocations';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: 'home', title: 'Home' },
        { key: 'mylocations', title: 'My Locations' },
      ],
    }
  }

  _renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomePage />;
      case 'mylocations':
        return <ListLocations index={this.state.index} />;
    }
  };

  render() {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
          >

            <TabView
              navigationState={this.state}
              renderScene={this._renderScene}
              onIndexChange={index => this.setState({ index })}
              initialLayout={{ width: Dimensions.get('window').width }}
            />

          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  };
}