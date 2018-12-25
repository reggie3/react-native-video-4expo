import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import VideoPlayer from 'react-native-video-player-no-linking';
import { Text, Button, Container } from 'native-base';
import { Video, ScreenOrientation } from 'expo';
import { withNavigation } from 'react-navigation';

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

class PlayVideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullScreen: false,
      videoInfo: {}
    };
    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.PORTRAIT);
    console.log('PlayVideoScreen initialized');
  }

  componentDidUpdate=(prevProps, prevState)=>{
    debugger;
    console.log('componentDidUpdate navigation: ', this.props.navigation);
    if (
      (this.props.navigation.state.params &&
        this.props.navigation.state.params.videoInfo &&
        !prevProps.navigation.state.params) ||
      (this.props.navigation.state.params &&
        this.props.navigation.state.params.videoInfo &&
        this.props.navigation.state.params.videoInfo !==
          prevProps.navigation.state.params.videoInfo)
    ) {
      console.log('player received video');
      console.log(this.props.navigation.state.params.videoInfo);
      this.setState({
        videoInfo: this.props.navigation.state.params.videoInfo,
        isVideoReady: true
      });
    }
  }

  toggleFullScreenCallback = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen }, () => {
      console.log({ isFullScreen: this.state.isFullScreen });
    });
  };

  renderPlayer = (uri) => {
    return (
      <View style={{ flex: 1 }}>
        {this.state.isFullScreen ? null : (
          <View
            style={{
              flex: 1,
              display: 'flex',
              backgroundColor: '#E5CCFF',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text>Boundary Area</Text>
          </View>
        )}
        <View
          style={{
            backgroundColor: 'rgba(25,100,255,0)',
            padding: 15,
            display: 'flex',
            flex: 2
          }}
        >
          <VideoPlayer
            videoProps={{
              shouldPlay: true,
              resizeMode: Video.RESIZE_MODE_CONTAIN,
              source: {
                uri
              }
            }}
            toggleFullScreenCallback={this.toggleFullScreenCallback}
            playCompleteCallback={() => {
              console.log('play complete');
            }}
            playFromPositionMillis={0}
            isLooping={false}
            showTimeStamp={true}
            playerPadding={10}
          />
        </View>
        {this.state.isFullScreen ? null : (
          <View
            style={{
              flex: 1,
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 5
            }}
          >
            <Text>Boundary Area</Text>
            <Button
              success
              block
              onPress={() => {
                this.props.navigation.navigate('HomeScreen');
              }}
            >
              <Text>Go to HomeScreen</Text>
            </Button>
          </View>
        )}
      </View>
    );
  };
  render() {
    const { navigation } = this.props;
    const videoInfo = navigation.getParam('videoInfo',null);
    console.log(videoInfo);
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        {videoInfo !== null ? (
          this.renderPlayer(videoInfo.uri)
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </Container>
    );
  }
}

export default withNavigation(PlayVideoScreen);
