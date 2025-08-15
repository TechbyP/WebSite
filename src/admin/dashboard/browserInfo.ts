export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = 'desktop';
  
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = /iPad|iPhone|iPod/.test(userAgent) ? 'ios' : 'android';
  }

  return {
    type: deviceType,
    browser: getBrowserName(userAgent),
    os: getOSName(userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  };
};

export const getConnectionInfo = async () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  return { effectiveType: 'unknown' };
};

const getBrowserName = (userAgent: string) => {
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('SamsungBrowser')) return 'samsung';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'opera';
  if (userAgent.includes('Trident')) return 'ie';
  if (userAgent.includes('Edge')) return 'edge';
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Safari')) return 'safari';
  return 'unknown';
};

const getOSName = (userAgent: string) => {
  if (userAgent.includes('Windows')) return 'windows';
  if (userAgent.includes('Mac')) return 'macos';
  if (userAgent.includes('Linux')) return 'linux';
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iOS') || /iPhone|iPad|iPod/.test(userAgent)) return 'ios';
  return 'unknown';
};