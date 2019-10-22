import { DeviceInfo } from '@youi/react-native-youi';
import { NativeModules } from 'react-native';

const systemName = DeviceInfo.getSystemName();
const { Cloud } = NativeModules;

interface Config {
  hasHardwareBackButton: boolean;
  isRoku: boolean;
}

export const Config: Config = {
  hasHardwareBackButton: !['iOS'].includes(systemName),
  isRoku: Cloud.isCloudServer,
};
