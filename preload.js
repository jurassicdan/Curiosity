import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("curiosityAPI", {
  getSetting: (setting) => ipcRenderer.invoke("get-setting", setting),
  getMedia: () => ipcRenderer.invoke("get-media"),
});
