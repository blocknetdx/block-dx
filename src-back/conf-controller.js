const request = require('superagent');

const apiBase = 'https://api.github.com/repos/BlocknetDX/blockchain-configuration-files';

module.exports.getSha = async function() {
  const { body } = await request
    .get(`${apiBase}/branches/master`);
  return body.commit.sha;
};

module.exports.getManifest = async function() {
  const { body: file } = await request
    .get(`${apiBase}/contents/manifest-latest.json`);
  const { text } = await request
    .get(file.download_url);
  return JSON.parse(text);
};

module.exports.getWalletConfs = async function() {
  const { body } = await request
    .get(`${apiBase}/contents/wallet-confs`);
  const files = body
    .filter(f => f.type === 'file');
  const data = await Promise.all(
    files.map(f => request.get(f.download_url))
  );
  return data
    .map((d, i) => {
      return [files[i].name, d.text];
    })
    .reduce((obj, [name, contents]) => {
      return Object.assign({}, obj, {[name]: contents});
    }, {});
};

module.exports.getXbridgeConfs = async function() {
  const { body } = await request
    .get(`${apiBase}/contents/xbridge-confs`);
  const files = body
    .filter(f => f.type === 'file');
  const data = await Promise.all(
    files.map(f => request.get(f.download_url))
  );
  return data
    .map((d, i) => {
      return [files[i].name, d.text];
    })
    .reduce((obj, [name, contents]) => {
      return Object.assign({}, obj, {[name]: contents});
    }, {});
};
