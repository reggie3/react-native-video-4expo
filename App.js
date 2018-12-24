import React from 'react';

import RecordVideoScreen from './RecordVideoScreen';
import PlayVideoScreen from './PlayVideoScreen';
import HomeScreen from './HomeScreen';
//
import { createStackNavigator } from 'react-navigation';
import { AppLoading, Font } from 'expo';

const RootStack = createStackNavigator(
  {
    HomeScreen: {
      screen: HomeScreen
    },
    RecordVideoScreen: {
      screen: RecordVideoScreen
    },
    PlayVideoScreen: {
      screen: PlayVideoScreen
    }
  },
  {
    initialRouteName: 'HomeScreen',
    navigationOptions: {
      title: 'Video Recorder 4Expo Demo',
      headerStyle: {
        backgroundColor: '#2266cc',

      },
      headerTintColor: '#44f',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#dbee00'
      },
    },
  }
  
);

export default class App extends React.Component {
  state = {
    fontLoaded: false
  };

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf')
    });
    this.setState({ fontLoaded: true });
  }

  render = () => {
    if (!this.state.fontLoaded) {
      return <AppLoading />;
    } else {
      return <RootStack />;
    }
  };
}
