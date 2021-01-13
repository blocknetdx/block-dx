const { logger } = require('./logger');

class RecursiveInterval {

  /**
   * Constructs a RecursiveInterval instance
   */
  constructor() {
    this._isSet = false;
    this._timeout = null;
    this._interval = 0;
  }

  /**
   * @param func {Function<Promise>}
   * @private
   */
  _recSet(func) {
    this._timeout = setTimeout(async function() {
      try {
        await func();
      } catch(err) {
        logger.error(err.message + '\n' + err.stack);
      }
      this._recSet(func);
    }.bind(this), this._interval);
  }

  /**
   * Sets the interval
   * @param func {Function<Promise>}
   * @param interval {Number}
   */
  set(func, interval = 0) {
    if(this._isSet) {
      const err = new Error('Set method on a RecursiveInterval instance can only be called once.');
      logger.error(err.message + '\n' + err.stack);
      return;
    } else {
      this._interval = interval;
      this._isSet = true;
      this._recSet(func);
    }
  }

  /**
   * Clears the interval
   */
  clear() {
    clearTimeout(this._timeout);
  }

}

module.exports = {RecursiveInterval};
