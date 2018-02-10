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

    let orderId;

    describe('getinfo method', () => {
      it('should get info from the service node', async function() {
        const res = await sn.getinfo();
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrderBook method', () => {
      it('should get the order book', async function() {
        const res = await sn.dxGetOrderBook(3, 'SYS', 'LTC', 50);
        // orderId = body.bids[0][2];
        // console.log(orderId);
        res.should.be.an.Object();
      });
    });

    // describe('dxGetOrder method', () => {
    //   it('should get order details', async function() {
    //     const body = await sn.dxGetOrder(orderId);
    //     console.log(body);
    //     body.should.be.an.Object();
    //   });
    // });

  });

});
