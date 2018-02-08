const request = require('superagent');

/**
 * Class representing a service node interface instance.
 */
class ServiceNodeInterface {

  /**
   * Constructs a service node interface instance.
   * @param {string} user - service node user
   * @param {string} password - service node password
   * @param {string} endpoint - location of service node e.g. http://localhost:41414
   */
  constructor(user, password, endpoint) {
    this._user = user;
    this._password = password;
    this._endpoint = endpoint;
  }

  async _makeServiceNodeRequest({ id = '', method, params = [] }) {
    const { status, body } = await request
      .post(this._endpoint)
      .auth(this._user, this._password)
      .send(JSON.stringify({
        id,
        method,
        params
      }));
    return { status, body };
  }

  /**
   * Calls getinfo on the service node
   * @returns {Promise<{status: {number}, body: {Object}}>}
   */
  async getinfo() {
    const { status, body } = await this._makeServiceNodeRequest({ method: 'getinfo' });
    return { status, body };
  }

}

module.exports = ServiceNodeInterface;
