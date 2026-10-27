import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appPath = path.join(app.getAppPath(), "./src/app");
const settingsPath = path.join(appPath, "/settings/settings.json");

let settings = {};

try {
  let rawData = fs.readFileSync(settingsPath, "utf-8");
  settings = JSON.parse(rawData);
  console.log("Success while reading settings");
} catch (err) {
  console.log("Error while trying to read settings: ", err);
}

const createWindow = () => {
  const win = new BrowserWindow({
    title: settings.app?.title,
    icon: settings.app?.logo,
    width: 800,
    height: 400,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  win.loadFile("./src/app/pages/index.html");
};

// IPC

ipcMain.handle("get-setting", (event, setting) => {
  if (settings && setting) {
    return settings[setting] !== undefined ? settings[setting] : null;
  }
});

ipcMain.handle("get-media", async () => {
  try {
    const formatTime = (seconds) => {
      if (isNaN(seconds) || seconds < 0) return "00:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const { stdout: metaOut } = await execPromise(
      'playerctl metadata --format "{{mpris:artUrl}}||{{ artist }}||{{ title }}||{{ mpris:length }}"',
    );

    const { stdout: posOut } = await execPromise("playerctl position");
    const { stdout: statusOut } = await execPromise("playerctl status");

    const [art, artist, title, lengthMicro] = metaOut.trim().split("||");
    const position = parseFloat(posOut.trim()) || 0;
    const duration = lengthMicro ? parseFloat(lengthMicro) / 1000000 : 0;

    const isPlaying = statusOut.trim() === "Playing";

    return {
      art: art || "/img/logo.jpg",
      artist: artist || "Unknow",
      title: title || "Unknow",
      position: formatTime(position),
      duration: formatTime(duration),
      isPlaying: isPlaying,
    };
  } catch (error) {
    return {
      art: "/logo.jpg",
      artist: "No Artist Detected",
      title: "No Music Detected",
      position: 0,
      duration: 0,
      isPlaying: false,
    };
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
