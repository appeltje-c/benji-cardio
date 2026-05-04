import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';

const HR_SERVICE = numberToUUID(0x180d);
const HR_MEASUREMENT_CHAR = numberToUUID(0x2a37);

export type HRCallback = (hr: number) => void;

let connectedDeviceId: string | null = null;

export async function scanAndConnectHRM(onHR: HRCallback): Promise<string> {
  await BleClient.initialize({ androidNeverForLocation: true });

  const device = await BleClient.requestDevice({
    services: [HR_SERVICE],
    optionalServices: [],
  });

  await BleClient.connect(device.deviceId, () => {
    connectedDeviceId = null;
  });

  connectedDeviceId = device.deviceId;

  await BleClient.startNotifications(device.deviceId, HR_SERVICE, HR_MEASUREMENT_CHAR, (value) => {
    const hr = parseHeartRate(value);
    if (hr !== null) {
      onHR(hr);
    }
  });

  return device.name ?? device.deviceId;
}

function parseHeartRate(value: DataView): number | null {
  const flags = value.getUint8(0);
  const is16Bit = (flags & 0x01) !== 0;
  if (is16Bit) {
    return value.getUint16(1, true);
  }
  return value.getUint8(1);
}

export async function disconnectHRM(): Promise<void> {
  if (connectedDeviceId) {
    try {
      await BleClient.stopNotifications(connectedDeviceId, HR_SERVICE, HR_MEASUREMENT_CHAR);
      await BleClient.disconnect(connectedDeviceId);
    } catch {
      // device may already be disconnected
    }
    connectedDeviceId = null;
  }
}

export function isConnected(): boolean {
  return connectedDeviceId !== null;
}
