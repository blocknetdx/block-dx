/* global describe, it */
require('should');
const ServiceNodeInterface = require('../service-node-interface');

describe('Service Node Interface', () => {

  const sn = new ServiceNodeInterface('myuser', 'mypassword', 'http://localhost:41414');

  it('Should be a constructor', () => {
    ServiceNodeInterface.should.be.a.Function();
  });

  it('Should construct a service node interface instance', () => {
    sn.should.be.an.instanceof(ServiceNodeInterface);
  });

  describe('Service Node Interface Instance', () => {

    describe('getinfo method', () => {
      it('should get info from the service node', async function() {
        const { status, body } = await sn.getinfo();
        status.should.equal(200);
        body.should.be.an.Object();
      });
    });

  });

});
