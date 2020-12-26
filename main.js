// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const API = require('@chris-kode/myanimelist-api-v2');
const pkceChallenge = require("pkce-challenge");
const axios = require('axios');
const express = require('express')();
require('dotenv').config();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const db = new JsonDB(new Config("details", true, true, '/'));
const pkce = pkceChallenge();
const oauth = new API.OAUTH(process.env.CLIENT_ID);
let access_token, refresh_token, expires_in;
let server, anime_list;

// Main function
async function main() {
  anime_list = new API.API_LIST_ANIME(access_token);

  
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (db.exists('/access_token') && db.exists('/refresh_token') && db.exists('/expires_in')) {
    // Credentials already exist
    access_token = db.getData('/access_token');
    refresh_token = db.getData('/refresh_token');
    expires_in = db.getData('/expires_in');

    console.log("Credentials found!");

    main();
  } else {
    // Get new credentials
    console.log('Fetching new credentials!');
    const challenge = pkce.code_challenge;
    const oauthURL = oauth.urlAuthorize(challenge);

    // Listen for response
    express.get('/', (req, res) => {
      // Send to oauth server
      axios.get(`https://ani.uwu.land/accessToken?code=${req.query.code}&challenge=${challenge}`)
        .then((response) => {
          response = response.data;

          if (response.error) {
            console.error(response.error);
            res.send('Something went wrong! Please restart the app and try again!');
          } else {
            access_token = response.body.access_token;
            refresh_token = response.body.refresh_token;
            expires_in = response.body.expires_in;
            db.push('/access_token', access_token);
            db.push('/refresh_token', refresh_token);
            db.push('/expires_in', expires_in);
            res.send('All looks good! Please close this tab and continue to the app! :3');

            console.log("Credentials produced!");
            server.close(() => console.log('Internal server closed.'));
            main();
          }
        }).catch((err) => {
          console.error(err);
          res.send('Something went wrong! Please restart the app and try again!');
        });
    });

    // Open log in url
    server = express.listen(7544, () => console.log('Internal server opened.'));
    shell.openExternal(oauthURL);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
