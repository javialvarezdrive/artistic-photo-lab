const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'dist', 'favicon.ico') // Asegúrate de que el icono exista o quita esta línea
    });

    // En producción, carga el archivo index.html de la carpeta dist
    // En desarrollo (opcional), podrías cargar el servidor de Vite
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));

    // Opcional: Abrir las herramientas de desarrollo
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
