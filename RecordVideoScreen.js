import React from 'react';
import { StyleSheet, View } from 'react-native';
import VideoPlayer from 'react-native-video-player-no-linking';
import { Text, Button, Container } from 'native-base';
import { Video, ScreenOrientation } from 'expo';
import { withNavigation } from 'react-navigation';
import Header from './Header';
import  VideoRecorder  from './VideoRecorder';
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


class RecordVideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  permissionsRetrievedCallback=(permissionsRetrievedCallbackRes)=>{
    console.log({permissionsRetrievedCallbackRes});
  }

  render() {
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        <VideoRecorder
        permissionsRetrievedCallback={this.permissionsRetrievedCallback}
        /* permissionsAlert={{
          display: true,
          title:  'Permissions Required',
          message: 'Camera permissions are required to add images to location.',
          tryAgainText: 'Try Again',
          doNotTryAgainText: 'OK'
        }} */ />
      </Container>
    );
  }
}

export default withNavigation(RecordVideoScreen);
