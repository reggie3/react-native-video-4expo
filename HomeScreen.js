import React from 'react';
import { View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Text, Container } from 'native-base';

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

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoInfo: null,
      isVideoReady: false,
      videoFileInfo: 'Video File Info Will Appear Here'
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.videoInfo !== prevState.videoInfo) {
      console.log('video has updated');

      // do checks to see if the video is valid and update isVideoReady
    }
  };

  render() {
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        <View
          style={{
            flex: 1,
            padding: 10
          }}
        >
          <Text
          style={{
            backgroundColor: 'white',
            flex: 1,
            padding: 5
          }}>{this.state.videoFileInfo} </Text>
        </View>
        <Button
          success
          block
          style={{ margin: 10 }}
          onPress={() => {
            this.props.navigation.navigate('RecordVideoScreen');
          }}
        >
          <Text>Record Video</Text>
        </Button>
        <Button
          success={this.state.isVideoReady}
          disabled={!this.state.isVideoReady}
          block
          style={{ margin: 10 }}
          onPress={() => {
            this.props.navigation.navigate('RecordVideoScreen');
          }}
        >
          <Text>Play Video</Text>
        </Button>
      </Container>
    );
  }
}

export default withNavigation(HomeScreen);
