/* eslint-disable react/display-name */
import React from 'react';
import { NativeModules } from 'react-native';

const { OrientationLock } = NativeModules;

export interface OrientationLock {
  setRotationMode: (orientation: RotationMode) => {};
}

export enum RotationMode {
  Landscape = 0,
  Portrait = 1,
  Auto = 2,
  LandscapeRight = 3,
  LandscapeLeft = 4,
  PortraitUpright = 5,
  AutoUpright = 6
}

export const withOrientation = (WrappedComponent: any, InitialRotationMode: RotationMode) =>
  class extends React.Component {
    componentWillMount() {
      if (InitialRotationMode !== undefined) {
        OrientationLock.setRotationMode(InitialRotationMode);
      } else {
        OrientationLock.setRotationMode(RotationMode.Auto);
      }

    }

    setRotationMode = (rotationMode: RotationMode) => {
      OrientationLock.setRotationMode(rotationMode);
    }

    render() {
      return <WrappedComponent setRotationMode={this.setRotationMode} {...this.props} />;
    }
  };
