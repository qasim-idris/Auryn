import { DeviceInfo } from '@youi/react-native-youi';
import { NativeModules, findNodeHandle } from 'react-native';

const systemName = DeviceInfo.getSystemName();
const { Cloud, RefUtils } = NativeModules;

interface AurynHelper {
  hasHardwareBackButton: boolean;
  isRoku: boolean;
  updateCloudScene: (component: React.RefObject<any>) => void;
  togglePointerEvents: (ref: React.RefObject<any>, enabled: boolean, onParentComp?: boolean) => void;
}

export const AurynHelper: AurynHelper = {
  hasHardwareBackButton: !['iOS'].includes(systemName),
  isRoku: Cloud.isCloudServer,
  updateCloudScene: (component) => {
    if (!Cloud.isCloudServer || !component.current) return;
    setTimeout(() => {
      Cloud.exportSubtree(findNodeHandle(component.current), false);
      Cloud.sendFocusMap();
    }, 300);
  },
  togglePointerEvents: (ref, enabled, onParentComp = false) => {
    if (!ref.current) return;

    if (onParentComp) {
      RefUtils.setParentCompositionPointerEvents(findNodeHandle(ref.current), enabled);
    } else {
      RefUtils.setPointerEvents(findNodeHandle(ref.current), enabled);
    }
  },
};
