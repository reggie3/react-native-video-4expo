import React, { Component } from 'react';
import {
  Text,
  Button,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Slider
} from 'react-native';
import { Video } from 'expo';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';

// Don't show the Spinner for very short periods of buffering
const CONTROL_FADE_DURATION = 200;

// the amount of time fast forward or rewind moves within the video
const VIDEO_JUMP_MILLIS = 5000;

const CONTROL_STATES = {
  SHOWN: 'SHOWN',
  SHOWING: 'SHOWING',
  HIDDEN: 'HIDDEN',
  HIDING: 'HIDING'
};

const PLAYBACK_STATES = {
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  BUFFERING: 'BUFFERING',
  ERROR: 'ERROR',
  ENDED: 'ENDED'
};

const SEEK_STATES = {
  NOT_SEEKING: 'NOT_SEEKING',
  SEEKING: 'SEEKING',
  SEEKED: 'SEEKED'
};

const getMMSSFromMillis = (millis) => {
  const totalSeconds = millis / 1000;
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor(totalSeconds / 60);

  const padWithZero = (number) => {
    const string = number.toString();
    if (number < 10) {
      return '0' + string;
    }
    return string;
  };
  return padWithZero(minutes) + ':' + padWithZero(seconds);
};

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.renderProps = undefined;
    this.videoRef = null;
    this.state = {
      // Playback state
      playbackState: PLAYBACK_STATES.LOADING,
      lastPlaybackStateUpdate: Date.now(),
      //Seeking state
      seekState: SEEK_STATES.NOT_SEEKING,
      // State comes from the playbackCallback
      playbackInstancePosition: null,
      playbackInstanceDuration: null,
      // Error message if we are in PLAYBACK_STATES.ERROR
      error: null,
      // Controls display state
      showControls: false,
      controlDisplayState: CONTROL_STATES.SHOWN,
      playbackStatus: {
        playableDurationMillis: 0,
        positionMillis: 0
      }
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    // this.props.debug && console.log({ state: this.state });
    // automatically show the controls if the video has ended
    if (
      this.state.playbackState === PLAYBACK_STATES.ENDED &&
      prevState.playbackState !== PLAYBACK_STATES.ENDED
    ) {
      this.setState({ showControls: true });
      this.props.playCompleteCallback();
    }

    if (this.state.isFullScreen !== prevState.isFullScreen) {
      this.props.toggleFullScreenCallback(this.state.isFullScreen);
    }

    if (this.state.controlDisplayState !== prevState.controlDisplayState) {
      // console.log({ updateControlDisplayState: this.state.controlDisplayState });
    }
  };

  // Handle events during playback
  setPlaybackState(playbackState) {
    if (this.state.playbackState != playbackState) {
      this.props.debug &&
        this.props.debug &&
        console.log(
          '[playback]',
          this.state.playbackState,
          ' -> ',
          playbackState,
          ' [seek] ',
          this.state.seekState,
          ' [shouldPlay] ',
          this.state.shouldPlay
        );

      this.setState({ playbackState, lastPlaybackStateUpdate: Date.now() });
    }
  }

  isPlayingOrBufferingOrPaused = (playbackStatus) => {
    this.props.debug && console.log({ isPlaying: playbackStatus.isPlaying });
    if (playbackStatus.isPlaying) {
      return PLAYBACK_STATES.PLAYING;
    }

    if (playbackStatus.isBuffering) {
      return PLAYBACK_STATES.BUFFERING;
    } else {
      console.log('animation detected');
      debugger;
    }
    return PLAYBACK_STATES.PAUSED;
  };

  onPlaybackStatusUpdate = (playbackStatus) => {
    /* this.props.debug && */ console.log('in playbackStatusUpdate: ', { playbackStatus });
    this.setState({ playbackStatus });
    try {
      this.props.onPlaybackStatusUpdateCallback(playbackStatus);
    } catch (e) {
      console.error(
        'Uncaught error when calling props.onPlaybackStatusUpdateCallback',
        e
      );
    }

    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        this.setPlaybackState(PLAYBACK_STATES.ERROR);
        const errorMsg = `Encountered a fatal error during playback: ${
          playbackStatus.error
        }`;
        this.setState({
          error: errorMsg
        });
        this.props.onError({ type: 'FATAL', message: errorMsg, obj: {} });
      }
    } else {
      // Update current position, duration, and `shouldPlay`
      this.setState({
        playbackInstancePosition: playbackStatus.positionMillis,
        playbackInstanceDuration: playbackStatus.durationMillis,
        shouldPlay: playbackStatus.shouldPlay
      });

      // Figure out what state should be next (only if we are not seeking, other the seek action handlers control the playback state,
      // not this callback)
      if (
        this.state.seekState === SEEK_STATES.NOT_SEEKING &&
        this.state.playbackState !== PLAYBACK_STATES.ENDED
      ) {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          this.setPlaybackState(PLAYBACK_STATES.ENDED);
        } else {
          // If the video is buffering but there is no Internet, you go to the ERROR state
          if (
            this.state.networkState === 'none' &&
            playbackStatus.isBuffering
          ) {
            this.setPlaybackState(PLAYBACK_STATES.ERROR);
            this.setState({
              error:
                'You are probably offline. Please make sure you are connected to the Internet to watch this video'
            });
          } else {
            console.log({
              controlDisplayState1: this.state.controlDisplayState
            });
            /* if (
              this.state.controlDisplayState !== CONTROL_STATES.SHOWN 
            ) { */
              console.log({
                controlDisplayState2: this.state.controlDisplayState
              });
              this.setPlaybackState(
                this.isPlayingOrBufferingOrPaused(playbackStatus)
              );
           // }
          }
        }
      }
    }
  };

  haltPlaybackForSliderValueChange = async () => {
    try {
      if (!this.state.tempDurationMillis) {
        this.setState({
          tempDurationMillis: this.state.playbackStatus.durationMillis
        });
      }
      let pauseAsyncRes = await this.videoRef.pauseAsync();
      this.props.debug && console.log({ pauseAsyncRes });
    } catch (error) {
      this.props.debug && console.log({ error });
    }
  };

  changePlaybackLocation = async (value) => {
    this.props.debug && console.log({ value });
    this.props.debug &&
      console.log({ tempDurationMillis: this.state.tempDurationMillis });
    try {
      let setStatusAsyncRes = await this.videoRef.setStatusAsync({
        positionMillis: value,
        durationMillis: this.state.tempDurationMillis
      });
      this.props.debug && console.log({ setStatusAsyncRes });
      this.props.debug && console.log(this.state);

      let playAsyncRes = await this.videoRef.playAsync();
      this.props.debug && console.log({ playAsyncRes });

      this.setState({ tempDurationMillis: null });
    } catch (error) {
      this.props.debug && console.log({ error });
    }
  };

  getPlaybackTimestamp = () => {
    if (
      this.state.playbackStatus.positionMillis != null &&
      this.state.playbackStatus.durationMillis != null
    ) {
      return `${getMMSSFromMillis(
        this.state.playbackStatus.positionMillis
      )} / ${getMMSSFromMillis(this.state.playbackStatus.durationMillis)}`;
    }
    return '';
  };

  maybeRenderStatusBar = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 5,
          backgroundColor: 'rgba(0,0,0,.5)',
          paddingVertical: 2
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {this.props.playbackSlider({
            minimumValue: 0,
            maximumValue: this.state.playbackStatus.playableDurationMillis,
            value: this.state.playbackStatus.positionMillis,
            onSlidingComplete: this.changePlaybackLocation,
            onValueChange: this.haltPlaybackForSliderValueChange,
            disabled:
              this.state.playbackState === PLAYBACK_STATES.LOADING ||
              this.state.playbackState === PLAYBACK_STATES.ENDED ||
              this.state.playbackState === PLAYBACK_STATES.ERROR ||
              this.state.showControls === true
          })}
        </View>
        {this.props.timeStamp({
          value: this.getPlaybackTimestamp(),
          isFullScreen: this.state.isFullScreen
        })}
        {this.props.fullScreenButton({
          onPress: () => {
            this.setState({ isFullScreen: true }, async () => {
              let fullScreenRes = await this.videoRef.presentFullscreenPlayer();
              this.props.debug && console.log({ fullScreenRes });
            });
          },
          isFullScreen: this.state.isFullScreen
        })}
      </View>
    );
  };

  // maybeRenderControls
  // Render the control panel and the button it contains
  // The view containing the player is touchable as well as the buttons
  // rendered by this function
  // Touching any of these touchables (view and buttons) toggles the display
  // the controls
  maybeRenderControls = () => {
    // ensure that the controls are hidden before changing the playing state
    // this keeps the user from seeing a quick flash of pause or play buttons
    // while the control bock is animating closed

    const hideControls = () => {
      this.setState({ showControls: false });
    };

    return (
      <TouchableWithoutFeedback
        style={{
          ...StyleSheet.absoluteFillObject
        }}
        onPress={() => {
          this.setState({ showControls: !this.state.showControls });
        }}
      >
        <Animatable.View
          duration={CONTROL_FADE_DURATION}
          animation={this.state.showControls ? 'fadeIn' : 'fadeOut'}
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,.75)',
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20
          }}
          onAnimationBegin={() => {
            if (this.state.controlDisplayState === CONTROL_STATES.HIDDEN) {
              this.setState({ controlDisplayState: CONTROL_STATES.SHOWING });
            } else if (
              this.state.controlDisplayState === CONTROL_STATES.SHOWN
            ) {
              this.setState({ controlDisplayState: CONTROL_STATES.HIDING });
            }
          }}
          onAnimationEnd={() => {
            if (this.state.controlDisplayState === CONTROL_STATES.SHOWING) {
              this.setState({
                controlDisplayState: CONTROL_STATES.SHOWN
              });
            } else if (
              this.state.controlDisplayState === CONTROL_STATES.HIDING
            ) {
              this.setState({ controlDisplayState: CONTROL_STATES.HIDDEN });
            }
          }}
        >
          {this.state.playbackState === PLAYBACK_STATES.ENDED &&
          this.state.playbackInstanceDuration ===
            this.state.playbackInstancePosition ? (
            <>
              {this.props.repeatVideoButton({
                onPress: async () => {
                  if (this.state.showControls) {
                    let playFromPositionAsyncRes = await this.videoRef.playFromPositionAsync(
                      0
                    );
                    this.setPlaybackState(
                      this.isPlayingOrBufferingOrPaused(
                        playFromPositionAsyncRes
                      )
                    );
                    hideControls();
                    // this.props.debug && console.log(isPlayingRes);
                    this.props.debug &&
                      console.log({ playBackState: this.state.playBackState });
                  }
                }
              })}
            </>
          ) : null}

          {this.state.playbackState === PLAYBACK_STATES.PAUSED ||
          this.state.playbackState === PLAYBACK_STATES.PLAYING ? (
            <>
              {this.props.rewindButton({
                onPress: async () => {
                  if (this.state.showControls) {
                    try {
                      let status = await this.videoRef.getStatusAsync();
                      this.props.debug && console.log({ status });

                      let res = await this.videoRef.setPositionAsync(
                        Math.max(status.positionMillis - VIDEO_JUMP_MILLIS, 0)
                      );
                      hideControls();
                      this.props.debug && console.log(res);
                    } catch (error) {
                      this.props.debug && console.log({ error });
                    }
                  } else {
                    this.setState({ showControls: !this.state.showControls });
                  }
                }
              })}
              {this.state.playbackState === PLAYBACK_STATES.PAUSED
                ? this.props.playButton({
                    onPress: async () => {
                      if (this.state.showControls) {
                        try {
                          let res = await this.videoRef.playAsync();
                          hideControls();
                          this.props.debug && console.log(res);
                        } catch (error) {
                          this.props.debug && console.log({ error });
                        }
                      } else {
                        this.setState({
                          showControls: !this.state.showControls
                        });
                      }
                    }
                  })
                : null}
              {this.state.playbackState === PLAYBACK_STATES.PLAYING
                ? this.props.pauseButton({
                    onPress: async () => {
                      if (this.state.showControls) {
                        try {
                          let res = await this.videoRef.pauseAsync();
                          hideControls();
                          this.props.debug && console.log(res);
                        } catch (error) {
                          this.props.debug && console.log({ error });
                        }
                      } else {
                        this.setState({
                          showControls: !this.state.showControls
                        });
                      }
                    }
                  })
                : null}
              {this.props.fastForwardButton({
                onPress: async () => {
                  if (this.state.showControls) {
                    try {
                      let status = await this.videoRef.getStatusAsync();
                      this.props.debug && console.log({ status });

                      let res = await this.videoRef.setPositionAsync(
                        Math.min(
                          status.positionMillis + VIDEO_JUMP_MILLIS,
                          status.playableDurationMillis
                        )
                      );
                      hideControls();
                      this.props.debug && console.log(res);
                    } catch (error) {
                      this.props.debug && console.log({ error });
                    }
                  } else {
                    this.setState({ showControls: !this.state.showControls });
                  }
                }
              })}
            </>
          ) : null}
        </Animatable.View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    return (
      <TouchableWithoutFeedback
        style={{
          ...StyleSheet.absoluteFillObject
        }}
        onPress={() => {
          this.setState({ showControls: !this.state.showControls });
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject
          }}
        >
          <Video
            ref={(component) => {
              this.videoRef = component;
            }}
            source={this.props.source}
            useNativeControls={this.props.useNativeControls}
            positionMillis={this.props.positionMillis}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={this.props.resizeMode}
            shouldPlay={this.props.shouldPlay}
            isLooping={this.props.isLooping}
            style={{ ...StyleSheet.absoluteFillObject }}
            onReadyForDisplay={this.props.onReadyForDisplayCallback}
            onPlaybackStatusUpdate={this.onPlaybackStatusUpdate}
            onLoadStart={this.props.onLoadStart}
            onLoad={this.props.onLoad}
            onError={this.props.onError}
          />
          {this.maybeRenderControls()}
          {this.maybeRenderStatusBar()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default VideoPlayer;

VideoPlayer.propTypes = {
  // The following that are standard to the Expo Video component are
  // defined here: https://docs.expo.io/versions/v31.0.0/sdk/video#props
  /*
  FIXME: figure out proptype to handle Expo.Asset input as specified 
  in documentation
   source: PropTypes.oneOfType([PropTypes.object, PropTypes.func]), */
  posterSource: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  useNativeControls: PropTypes.bool,
  resizeMode: PropTypes.string,
  usePoster: PropTypes.bool,
  rate: PropTypes.number,
  volume: PropTypes.number,
  isMuted: PropTypes.bool,
  shouldPlay: PropTypes.bool,
  isLooping: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  playFromPositionMillis: PropTypes.number,

  // show debug statements in console
  debug: PropTypes.bool,

  // Callback functions
  onError: PropTypes.func,
  toggleFullScreenCallback: PropTypes.func,
  playCompleteCallback: PropTypes.func,
  onLoadStart: PropTypes.func,
  onLoad: PropTypes.func,
  onReadyForDisplayCallback: PropTypes.func,
  onPlaybackStatusUpdateCallback: PropTypes.func,

  // UI Components
  playButton: PropTypes.func,
  pauseButton: PropTypes.func,
  fastForwardButton: PropTypes.func,
  rewindButton: PropTypes.func,
  repeatVideoButton: PropTypes.func,
  playbackSlider: PropTypes.func,
  showTimeStamp: PropTypes.bool,
  timeStamp: PropTypes.func,
  fullScreenButton: PropTypes.func
};

VideoPlayer.defaultProps = {
  source: { uri: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' },
  posterSource: {
    uri:
      'https://en.wikipedia.org/wiki/Big_Buck_Bunny#/media/File:Big_buck_bunny_poster_big.jpg'
  },
  useNativeControls: false,
  resizeMode: Video.RESIZE_MODE_CONTAIN,
  usePoster: false,
  rate: 1.0,
  volume: 1.0,
  isMuted: false,
  shouldPlay: true,
  isLooping: false,
  width: 300,
  height: 300,
  playFromPositionMillis: 0,
  debug: false,

  onError: () => {},
  toggleFullScreenCallback: () => {},
  playCompleteCallback: () => {},
  onLoadStart: () => {},
  onLoad: () => {},
  onReadyForDisplayCallback: () => {},
  onPlaybackStatusUpdateCallback: () => {},

  playButton: (renderProps) => {
    return (
      <TouchableOpacity
        onPress={renderProps.onPress}
        success
        style={bigButtonStyle}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'>'}</Text>
      </TouchableOpacity>
    );
  },
  pauseButton: (renderProps) => {
    return (
      <TouchableOpacity
        success
        style={bigButtonStyle}
        onPress={renderProps.onPress}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'||'}</Text>
      </TouchableOpacity>
    );
  },
  fastForwardButton: (renderProps) => {
    return (
      <TouchableOpacity
        onPress={renderProps.onPress}
        success
        style={buttonStyle}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'>>'}</Text>
      </TouchableOpacity>
    );
  },
  rewindButton: (renderProps) => {
    return (
      <TouchableOpacity
        onPress={renderProps.onPress}
        success
        style={buttonStyle}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'<<'}</Text>
      </TouchableOpacity>
    );
  },
  repeatVideoButton: (renderProps) => {
    return (
      <TouchableOpacity
        onPress={renderProps.onPress}
        success
        style={bigButtonStyle}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'|<<'}</Text>
      </TouchableOpacity>
    );
  },
  playbackSlider: (renderProps) => {
    return (
      <Slider
        minimumValue={renderProps.minimumValue}
        maximumValue={renderProps.maximumValue}
        value={renderProps.value}
        onSlidingComplete={renderProps.onSlidingComplete}
        onValueChange={renderProps.onValueChange}
        disabled={renderProps.disabled}
      />
    );
  },
  showTimeStamp: true,
  timeStamp: (renderProps) => {
    return (
      <View style={{ background: 'rgba(0,0,0,.5)', marginHorizontal: 5 }}>
        <Text style={{ color: 'white', fontSize: 20 }}>
          {renderProps.value}
        </Text>
      </View>
    );
  },
  fullScreenButton: (renderProps) => {
    return (
      <TouchableOpacity onPress={renderProps.onPress} style={smallButtonStyle}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{'^'}</Text>
      </TouchableOpacity>
    );
  }
};
const buttonTemplate = {
  alignSelf: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white'
};

const bigButtonStyle = {
  ...buttonTemplate,
  width: 72,
  height: 72,
  borderRadius: 36
};

const buttonStyle = {
  ...buttonTemplate,
  width: 64,
  height: 64,
  borderRadius: 32
};

const smallButtonStyle = {
  ...buttonTemplate,
  width: 24,
  height: 24,
  borderRadius: 12
};
