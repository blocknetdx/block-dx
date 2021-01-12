const { ipcMain } = require('electron');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const isString = require('lodash/isString');
const isDev = require('electron-is-dev');

class Logger {

  constructor() {
    this._logger = null;
  }

  /**
   * @param dataDir {String}
   */
  initialize(dataDir) {
    this._logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({
          filename: path.join(dataDir, 'main.log'),
          maxsize: 1000000,
          maxFiles: 5,
          tailable: true
        }),
        new transports.Console()
      ]
    });
    ipcMain.on('LOGGER_INFO', (e, str) => {
      this.info(str);
    });
    ipcMain.on('LOGGER_ERROR', (e, str) => {
      this.error(str);
    });
  }

  /**
   * @param str {String}
   */
  info(str) {
    if(this._logger && isString(str)) {
      this._logger.info('INFO: ' + str);
    } else {
      console.log(str);
    }
  }

  /**
   * @param str {String}
   */
  error(str) {
    if(this._logger && isString(str)) {
      this._logger.error('ERROR: ' + str);
    } else {
      console.log(str);
    }
  }

}

module.exports.logger = new Logger;
