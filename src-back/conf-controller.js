const request = require('superagent');

const atATime = (max, promiseFuncs) => new Promise((resolve, reject) => {
  promiseFuncs = [...promiseFuncs];
  const resultsObj = {};
  const promises = [];
  for(let i = 0; i < max; i++) {
    promises.push((async function() {
      while(promiseFuncs.length > 0) {
        const idx = promiseFuncs.length - 1;
        const func = promiseFuncs.pop();
        const res = await func();
        resultsObj[idx] = res;
      }
    })());
  }
  Promise
    .all(promises)
    .then(() => {
      resolve(Object
        .keys(resultsObj)
        .sort((a, b) => {
          a = Number(a);
          b = Number(b);
          return a === b ? 0 : a > b ? 1 : -1;
        })
        .map(key => resultsObj[key])
      );
    })
    .catch(reject);
});

class ConfController {

  constructor({ storage }) {
    this._storage = storage;
    this._walletConfPatt = /^wallet-confs\/(.+\.conf$)/;
    this._xbridgeConfPatt = /^xbridge-confs\/(.+\.conf$)/;
    this._manifestPath = 'https://s3.amazonaws.com/blockdxbuilds/blockchainconfig/blockchainconfigfilehashmap.json';
  }

  async update() {

    const storage = this._storage;
    const manifestPath = this._manifestPath;

    // Compare hashes
    const prevSha = storage.getItem('manifestSha') || '';
    const newSha = await this.getSha();
    if(prevSha === newSha) return;

    // Get manifest
    const res = await request.get(manifestPath);
    const manifestData = res.body;
    const manifestKey = 'manifest-latest.json';
    const { text: manifestJSON } = await request.get(manifestData[manifestKey][1]);
    const manifest = JSON.parse(manifestJSON);

    const keys = Object.keys(manifestData);
    const prevManifestData = storage.getItem('manifestData') || {};

    // Get xbridge confs
    const xbridgeConfPatt = this._xbridgeConfPatt;
    const xbridgeConfKeys = keys.filter(key => xbridgeConfPatt.test(key));
    const prevXbridgeConfs = this._storage.getItem('xbridgeConfs') || {};
    const xbridgeConfs = await this.getConfs(xbridgeConfKeys, manifestData, prevManifestData, xbridgeConfPatt, prevXbridgeConfs);

    // Get wallet confs
    const walletConfPatt = this._walletConfPatt;
    const walletConfKeys = keys.filter(key => walletConfPatt.test(key));
    const prevWalletConfs = this._storage.getItem('walletConfs') || {};
    const walletConfs = await this.getConfs(walletConfKeys, manifestData, prevManifestData, walletConfPatt, prevWalletConfs);

    storage.setItems({
      manifestSha: newSha,
      manifestData,
      manifest,
      walletConfs,
      xbridgeConfs
    }, true);

  }

  async getSha() {
    const res = await request
      .head(this._manifestPath);
    return res.headers['x-amz-meta-x-manifest-hash'];
  }

  async getConfs(confKeys, newData, prevData, confPatt, prevConfs) {

    const keyToFilename = confKeys
      .reduce((obj, key) => Object.assign({}, obj, {[key]: key.match(confPatt)[1]}), {});

    const newConfs = {};

    const promiseFuncs = confKeys
      .filter(key => {
        const newHash = newData[key][0];
        const prevHash = prevData[key] ? prevData[key][0] : '';
        return newHash !== prevHash || !prevConfs[keyToFilename[key]];
      })
      .map(key => async function() {
        const { text } = await request.get(newData[key][1]);
        const fileName = keyToFilename[key];
        newConfs[fileName] = text;
      });

    // Limit downloads to only so many at a time in order to not choke internet connections
    await atATime(40, promiseFuncs);

    // Merge unchanged confs with new confs
    const confs = confKeys
      .reduce((obj, key) => {
        const fileName = keyToFilename[key];
        if(newConfs[fileName]) {
          return Object.assign({}, obj, {[fileName]: newConfs[fileName]});
        } else {
          return Object.assign({}, obj, {[fileName]: prevConfs[fileName]});
        }
      }, {});

    return confs;

  }

}

module.exports = ConfController;
