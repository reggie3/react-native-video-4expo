import React from 'react';

import RecordVideoScreen from './RecordVideoScreen';
import PlayVideoScreen from './PlayVideoScreen';
import IntroScreen from './IntroScreen';
//
import { createStackNavigator } from 'react-navigation';
import { AppLoading, Font } from 'expo';

const RootStack = createStackNavigator(
  {
    IntroScreen: {
      screen: IntroScreen
    },
    RecordVideoScreen: {
      screen: RecordVideoScreen
    },
    PlayVideoScreen: {
      screen: PlayVideoScreen
    }
  },
  {
    initialRouteName: 'IntroScreen',
    navigationOptions: {
      header: null
    }
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
