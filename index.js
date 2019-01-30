const electron = require('electron');
const ytdl = require('ytdl-core');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let appWindow, history = [];

app.on('ready', () => {
        appWindow = new BrowserWindow({
                width: '500',
                height: '500',
                resizable: false,
        });
        appWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'appWindow.html'),
                protocol: 'file:',
                slashes: true,
        }));

        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        Menu.setApplicationMenu(mainMenu);
});

function clearHistory(){
        appWindow.webContents.send('clear:history');
}

ipcMain.on('URL:submit', (e, URL) => {
        ytdl.getInfo(URL, (e, info) => {
                if(e){
                        appWindow.webContents.send('URL:invalid');
                        return;
                }
                // console.log(info.title);
                appWindow.webContents.send('update:history', info.title);
                var a = ytdl(URL,{quality: 'highest'}).pipe(fs.createWriteStream(`${info.title}.mp4`));
                appWindow.webContents.send('download:start');
                a.on('finish', () => {
                        appWindow.webContents.send('download:finish');
                });
        });
});

const mainMenuTemplate = [
        {
                label: 'File',
                submenu: [
                        {
                                label: 'Clear History',
                                accelerator: process.platform == 'darwin'? 'Command+B': 'Ctrl+B',
                                click(){
                                        clearHistory();
                                }
                        },
                        {
                                label: 'Exit',
                                accelerator: process.platform == 'darwin'? 'Command+Q': 'Ctrl+Q',
                                click(){
                                        app.quit();
                                }
                        }
                ]
        }
];

// If OSX, add empty object to menuTemplate
if(process.platform == 'darwin'){
        mainMenuTemplate.unshift({});
}