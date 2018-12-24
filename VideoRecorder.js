import React from 'react';
import { Text, View, Alert } from 'react-native';
import { Camera, Permissions } from 'expo';
import PropTypes from 'prop-types';

class VideoRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.renderProps = undefined;
    this.cameraRef = null;
    this.state = {
      isRecording: false,
      error: null,
      hasPermissions: false,
      showCamera: false
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

  componentDidUpdate = (prevProps, prevState) => {};

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
        console.log({ err });
        this.showPermissionsAlert();
      });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>VideoRecorder</Text>
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
    doNotTryAgainText: PropTypes.string
  })
};

VideoRecorder.defaultProps = {
    permissionsAlert: {
    display: true,
    title: 'Permissions Required',
    message: 'Camera permissions are required to add images to location.',
    tryAgainText: 'Try Again',
    doNotTryAgainText: 'OK'
  }
};
