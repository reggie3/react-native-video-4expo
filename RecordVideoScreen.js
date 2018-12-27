import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text, Button, Container, Icon } from 'native-base';
import { withNavigation } from 'react-navigation';
import { VideoRecorder } from './index';
import { Camera } from 'expo';
import * as styles from './styles';

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
    this.state = {};
  }

  permissionsRetrievedCallback = (permissionsRetrievedCallbackRes) => {
    console.log({ permissionsRetrievedCallbackRes });
  };

  doNotTryAgainCallback = () => {
    console.log('Permissions denied');
  };

  onVideoRecorderError = (error) => {
    console.log({ error });
  };

  onRecordingCompleteCallback = () => {
    console.log('onRecordingCompleteCallback called');
  };

  onStartRecording = () => {
    console.log('onStartRecording');
  };

  onStopRecording = () => {
    console.log('onStopRecording');
  };

  onCloseVideoRecorder = (videoInfo) => {
    this.props.navigation.navigate('HomeScreen', { videoInfo });
  };

  render() {
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        <VideoRecorder
          permissionsRetrievedCallback={this.permissionsRetrievedCallback}
          doNotTryAgainCallback={this.doNotTryAgainCallback}
          onError={this.onVideoRecorderError}
          getVideoCallback={this.getVideoCallback}
          recordingOptions={{
            maxDuration: 30,
            quality: Camera.Constants.VideoQuality['720p']
          }}
          denyPermissionRequestCallback={() => {
            console.log('request for permissions denied');
            this.props.navigation.goBack();
          }}
          /* permissionsAlert={{
          display: true,
          title:  'Permissions Required',
          message: 'Camera permissions are required to add images to location.',
          tryAgainText: 'Try Again',
          doNotTryAgainText: 'OK'
        }} */

         /*  activityIndicator={() => {
            return <ActivityIndicator size="large" color="#00ff00" />;
          }} */
          /* startRecordingButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                  this.onStartRecording();
                }}
                danger
                style={{
                  ...styles.bigButtonStyle,
                  backgroundColor: 'red',
                  borderWidth: 6,
                  borderColor: 'lightgray'
                }}
              />
            );
          }} */
          /* stopRecordingButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                  this.onStopRecording();
                }}
                style={{
                  ...styles.bigButtonStyle,
                  border: 3,
                  backgroundColor: 'lightgray',
                  borderColor: 'white'
                }}
              />
            );
          }} */
          closeVideoRecorderButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                  this.onCloseVideoRecorder(renderProps.videoInfo);
                }}
                block
                info
                style={{ margin: 5 }}
              >
                <Text>Go Back</Text>
              </Button>
            );
          }}
          flashOnButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                }}
                info
                style={styles.flashButtonStyle}
              >
                <Icon type="MaterialIcons" name="flash-on" />
              </Button>
            );
          }}
          flashOffButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                }}
                info
                style={styles.flashButtonStyle}
              >
                <Icon type="MaterialIcons" name="flash-off" />
              </Button>
            );
          }}
          flashAutoButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                }}
                info
                style={styles.flashButtonStyle}
              >
                <Icon type="MaterialIcons" name="flash-auto" />
              </Button>
            );
          }}
          flashTorchButton={(renderProps) => {
            return (
              <Button
                onPress={() => {
                  renderProps.onPress();
                }}
                info
                style={styles.flashButtonStyle}
              >
                <Icon type="MaterialIcons" name="highlight" />
              </Button>
            );
          }}
          showTimer={true}
          timerComponent={(renderProps) => {
            return (
              <View style={{ background: 'rgba(0,0,0,.5' }}>
                <Text style={{ color: 'white', fontSize: 20 }}>
                  {renderProps.value}
                </Text>
              </View>
            );
          }}
        />
      </Container>
    );
  }
}

export default withNavigation(RecordVideoScreen);
