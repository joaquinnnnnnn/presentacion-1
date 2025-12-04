import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.tuNombre.clarifi",
  appName: "Clarifi",
  webDir: "out",
  //bundledWebRuntime: false,
  server: {
    url: "http://172.20.10.2:9002",
    cleartext: true
  }
};

export default config;
