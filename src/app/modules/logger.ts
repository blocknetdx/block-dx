class Logger {
  constructor() {}

  info(message: String): void {
    console.log('info', message);
    window.electron.ipcRenderer.send('LOGGER_INFO', message);
  }

  error(message: String): void {
    console.log(message);
    window.electron.ipcRenderer.send('LOGGER_ERROR', message);
  }

}

export const logger = new Logger();
