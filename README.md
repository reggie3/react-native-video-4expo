# React Native Video 4 Expo (react-native-video-4expo)

## Customizable video recording and playing for projects that use the Expo SDK

### This package relies the Expo Video and Audio components, and will not work on projects that do not have Expo installed.


[![npm](https://img.shields.io/npm/v/react-native-video-4expo.svg)](https://www.npmjs.com/package/react-native-video-4expo)

[![npm](https://img.shields.io/npm/dm/react-native-video-4expo.svg)](https://www.npmjs.com/package/react-native-video-4expo)

[![npm](https://img.shields.io/npm/dt/react-native-video-4expo.svg)](https://www.npmjs.com/package/react-native-video-4expo)

[![npm](https://img.shields.io/npm/l/react-native-video-4expo.svg)](https://github.com/react-native-component/react-native-video-4expo/blob/master/LICENSE)

## Click to view a demo video of the component in action.
[![YouTube Demo Video](https://img.youtube.com/vi/oHJmvOntDT8/0.jpg)](https://www.youtube.com/watch?v=oHJmvOntDT8)


## Why Use This?

This module is useful if you need drop video player or recorder components for an application in which using platform specific native code is prohibited; for example an application created using Expo.io.
Additionally, these components allow you to customize various UI elements such as playback and recording controls, sliders, timestamps, camera controls, etc.

## Why Not Use This?

You are not prohibited from using native code, and can find a better module to use. One option is [react-native-video](https://github.com/react-native-community/react-native-video#readme)

## Installation

`npm install --save react-native-video-4expo`

## Usage

`import {VideoPlayer, VideoRecorder} from 'react-native-video-4expo';`

## Component Properties

### Video Player
The video player is wraps the [Expo Video component](https://docs.expo.io/versions/latest/sdk/video) and inherits its [properties](https://docs.expo.io/versions/latest/sdk/video#props).  Properties specific to this component are described below.

### Video Recorder
The video recorder is wraps the [Expo Camera component](https://docs.expo.io/versions/latest/sdk/camera) and inherits its [properties](https://docs.expo.io/versions/latest/sdk/camera#props).  Properties specific to this component are described below.