import React from 'react';
import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  TouchableHighlight,
  StyleSheet
} from 'react-native';
import { Camera, Permissions, FileSystem } from 'expo';
import PropTypes from 'prop-types';

const flashStates = ['on', 'off', 'auto', 'torch'];
const formattedSeconds = (sec) => {
  Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
};

class VideoRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.renderProps = undefined;
    this.cameraRef = null;
    this.state = {
      isRecording: false,
      error: null,
      hasPermissions: false,
      showCamera: false,
      flashState: flashStates[0],
      timer: null,
      counter: '00',
      miliseconds: '00'
    };
  }

  componentDidMount = async () => {
    // check if permissions have already been granted
    const permissionsRes = await Permissions.getAsync(
      Permissions.CAMERA,
      Permissions.AUDIO_RECORDING
    );

    if (permissionsRes.status !== 'granted') {
      //ask for permissions
      this.askForPermissions();
    } else if (permissionsRes.status === 'granted') {
      this.setState({ hasPermissions: true, showCamera: true });
    } else {
      this.props.onError({
        hasError: true,
        message: 'Error: checking permissions'
      });
    }
  };

  showPermissionsAlert = () => {
    Alert.alert(
      this.props.permissionsAlert.title,
      this.props.permissionsAlert.message,
      [
        {
          text: this.props.permissionsAlert.tryAgainText,
          onPress: () => {
            this.askForPermissions();
          }
        },
        {
          text: this.props.permissionsAlert.doNotTryAgainText,
          onPress: () => {
            this.renderProps.onMediaSelectionCanceled();
          }
        }
      ],
      { cancelable: true }
    );
  };

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }
  async askForPermissions() {
    Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING)
      .then((res) => {
        console.log({ res });
        if (res.status === 'granted') {
          // update the permissions in app state so that the callback
          // can reference the correct values next time it is called
          this.setState({ hasPermissions: true, showCamera: true });
          this.permissionsRetrievedCallback(res);
        } else {
          this.showPermissionsAlert();
        }
      })
      .catch((err) => {
        this.showPermissionsAlert();
      });
  }

  onStartRecord = async () => {
    this.startTimer();

    if (this.cameraRef !== null) {
      this.setState({
        error: null,
        isRecording: true
      });

      try {
        let recordingRes = await this.cameraRef.recordAsync(
          this.props.recordingOptions
        );
        console.log({ recordingRes });
        let fileInfoRes = FileSystem.getInfoAsync(recordingRes.uri);
        console.log({ fileInfoRes });
        this.setState({
          videoInfo: {
            ...recordingRes,
            size: fileInfoRes.size,
            created: fileInfoRes.modificationTime
          }
        });
        this.setState({
          isRecording: false
        });
      } catch (error) {
        console.log('Error: ', error);
        this.setState({
          isRecording: false,
          error: error.message
        });
        this.props.onError({
          hasError: true,
          error
        });
      }
    } else {
      this.props.onError({
        hasError: true,
        message: 'Error: cameraRef === null'
      });
    }
  };

  startTimer = () => {
    let timer = setInterval(
      () =>
        this.setState({
          secondsElapsed: this.state.secondsElapsed + 1
        }),
      1000
    );
    this.setState({ timer });
  };

  onStopRecord = () => {
    // stop the timer
    clearInterval(this.state.timer);

    if (this.cameraRef !== null) {
      this.cameraRef.stopRecording();
      this.setState({
        isRecording: false
      });
    }
  };

  toggleRecord = () => {
    if (this.state.isRecording) {
      this.onStopRecord();
    } else {
      this.onStartRecord();
    }
  };

  renderTopControls = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 5,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
      >
        {this.props.showTimer ? this.renderTimer() : null}
        {this.renderFlashControls()}
      </View>
    );
  };

  renderTimer = () => {
    return this.props.timerComponent({
      value: this.state.secondsElapse
    });
  };

  renderFlashControls = () => {
    switch (this.state.flashState) {
      case 'on':
        return this.props.flashOnButton({
          onPress: () => {
            this.toggleFlash();
          }
        });
      case 'off':
        return this.props.flashOffButton({
          onPress: () => {
            this.toggleFlash();
          }
        });
      case 'auto':
        return this.props.flashAutoButton({
          onPress: () => {
            this.toggleFlash();
          }
        });
      case 'torch':
        return this.props.flashTorchButton({
          onPress: () => {
            this.toggleFlash();
          }
        });
      default:
        this.props.onError({
          hasError: true,
          message: 'Error: unknown flash state'
        });
    }
  };

  toggleFlash = () => {
    const currentStateIndex = flashStates.indexOf(this.state.flashState);
    const newState = (currentStateIndex + 1) % flashStates.length;

    console.log(`new flash State = ${flashStates[newState]}`);
    this.setState({ flashState: flashStates[newState] });
  };

  renderBottomControls = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 5
        }}
      >
        {this.state.isRecording
          ? this.props.stopRecordingButton({
              onPress: () => {
                this.toggleRecord();
              },
              isRecording: this.state.isRecording
            })
          : this.props.startRecordingButton({
              onPress: () => {
                this.toggleRecord();
              },
              isRecording: this.state.isRecording
            })}
        {this.props.closeVideoRecorderButton({
          onPress: () => {},
          videoInfo: this.state.videoInfo,
          isRecording: this.state.isRecording
        })}
      </View>
    );
  };
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.showCamera ? (
          <>
            <Camera
              style={{ flex: 1 }}
              type={this.state.type}
              flashMode={this.state.flashState}
              ref={(ref) => {
                this.cameraRef = ref;
              }}
            />
            {this.renderTopControls()}
            {this.renderBottomControls()}
          </>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {this.props.activityIndicator()}
          </View>
        )}
      </View>
    );
  }
}

export default VideoRecorder;

VideoRecorder.propTypes = {
  // permissionsRetrievedCallback: function called when permssions are successfully retrieved
  // receives permssions respons as argument
  permissionsRetrievedCallback: PropTypes.func,

  // permissionsAlert: properties controlling alert that pops up if user
  // does not grant required permissions
  permissionsAlert: PropTypes.shape({
    display: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    tryAgainText: PropTypes.string,
    doNotTryAgainText: PropTypes.string,
    doNotTryAgainCallback: PropTypes.func
  }),

  // spinner shown until the the camera is available
  activityIndicator: PropTypes.func,

  // onError: callback that is passed an error object
  onError: PropTypes.func,

  // UI elements
  startRecordingButton: PropTypes.func.isRequired,
  stopRecordingButton: PropTypes.func.isRequired,
  closeVideoRecorderButton: PropTypes.func.isRequired,

  // Flash control UI elements
  flashOnButton: PropTypes.func,
  flashOffButton: PropTypes.func,
  flashAutoButton: PropTypes.func,

  // recordingOptions: an object matching Expo.Camera recording options
  // see here: https://docs.expo.io/versions/v31.0.0/sdk/camera#recordasync
  recordingOptions: PropTypes.object,

  // showTimer: show a timer while recording
  showTimer: PropTypes.bool,

  // timer: function returning component to render as timeStamp
  timerComponent: PropTypes.func
};

VideoRecorder.defaultProps = {
  permissionsAlert: {
    display: true,
    title: 'Permissions Required',
    message: 'Camera permissions are required to add images to location.',
    tryAgainText: 'Try Again',
    doNotTryAgainText: 'OK',
    doNotTryAgainCallback: () => {
      console.log('permissions denied');
    }
  },

  activityIndicator: () => {
    return <ActivityIndicator size="large" color="#00ff00" />;
  },
  onError: (error) => {
    console.log({ error });
  },
  recordingOptions: {
    maxDuration: 5,
    quality: Camera.Constants.VideoQuality['720p']
  },
  flashOnButton: ({ onPress }) => {
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#E0E0E0">
        <Text style={styles.defaultButton}>Flash On</Text>
      </TouchableHighlight>
    );
  },
  flashOffButton: ({ onPress }) => {
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#E0E0E0">
        <Text style={styles.defaultButton}>Flash Off</Text>
      </TouchableHighlight>
    );
  },
  flashAutoButton: ({ onPress }) => {
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#E0E0E0">
        <Text style={styles.defaultButton}>Auto Flash</Text>
      </TouchableHighlight>
    );
  },
  flashTorchButton: ({ onPress }) => {
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#E0E0E0">
        <Text style={styles.defaultButton}>Torch</Text>
      </TouchableHighlight>
    );
  },
showTimer: true,
  timerComponent: ({ value }) => {
    return <Text style={{ color: 'white' }}>{formattedSeconds(value)}</Text>;
  }
};

const styles = StyleSheet.create({
  defaultButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    color: 'black'
  }
});