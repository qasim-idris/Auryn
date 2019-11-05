import { DeviceInfo } from '@youi/react-native-youi';
import { NativeModules, findNodeHandle } from 'react-native';

const systemName = DeviceInfo.getSystemName();
const { Cloud } = NativeModules;

interface AurynHelper {
  hasHardwareBackButton: boolean;
  isRoku: boolean;
  updateCloudScene: (component: React.RefObject<any>) => void;
}

export const AurynHelper: AurynHelper = {
  hasHardwareBackButton: !['iOS'].includes(systemName),
  isRoku: Cloud.isCloudServer,
  updateCloudScene: component => {
    if (!Cloud.isCloudServer) return;
    setTimeout(() => {
      Cloud.exportSubtree(findNodeHandle(component.current), false);
      Cloud.sendFocusMap();
    }, 300);
  },
};
