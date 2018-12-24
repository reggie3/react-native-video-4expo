import React from 'react';
import { StyleSheet, View } from 'react-native';
import VideoPlayer from 'react-native-video-player-no-linking';
import { Text, Button, Container } from 'native-base';
import { Video, ScreenOrientation } from 'expo';
import { withNavigation } from 'react-navigation';
import Header from './Header';
import { VideoRecorder } from './VideoRecorder';
const random_rgba = () => {
  var o = Math.round,
    r = Math.random,
    s = 255;
  return (
    'rgba(' +
    o(r() * s) +
    ',' +
    o(r() * s) +
    ',' +
    o(r() * s) +
    ',' +
    r().toFixed(1) +
    ')'
  );
};
const BACKGROUND_COLOR = random_rgba();

const URI =
  'https://res.cloudinary.com/tourystory/video/upload/v1544021333/FACEBOOK-2138947072790494--d2a00850-f89c-11e8-81c6-d3965f15fa89/d39bf480-f89c-11e8-81c6-d3965f15fa89--d68bc170-f89c-11e8-81c6-d3965f15fa89.mp4';

class RecordVideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullScreen: false
    };
    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.PORTRAIT);
  }

  toggleFullScreenCallback = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen }, () => {
      console.log({ isFullScreen: this.state.isFullScreen });
    });
  };

  render() {
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        <Header />
        <VideoRecorder />
      </Container>
    );
  }
}

export default withNavigation(RecordVideoScreen);
