const fs = require('fs');
const path = require('path');
const { ipcRenderer, remote } = require('electron');
const { splitConf } = require('../../../../src-back/util');

module.exports.removeNonWordCharacters = (str = '') => str.replace(/\W/g, '');

const versionPatt = /(\d+)\.(\d+)\.(\d+)/;

module.exports.compareByVersion = (aVersion, bVersion) => {
  if(versionPatt.test(aVersion) && versionPatt.test(bVersion)) {
    const matchesA = aVersion.match(versionPatt);
    const matchesB = bVersion.match(versionPatt);
    matchesA[1] = Number(matchesA[1]);
    matchesA[2] = Number(matchesA[2]);
    matchesA[3] = Number(matchesA[3]);
    matchesB[1] = Number(matchesB[1]);
    matchesB[2] = Number(matchesB[2]);
    matchesB[3] = Number(matchesB[3]);
    if(matchesA[1] === matchesB[1]) {
      if(matchesA[2] === matchesB[2]) {
        return matchesA[3] === matchesB[3] ? 0 : matchesA[3] > matchesB[3] ? -1 : 1;
      } else {
        return matchesA[2] > matchesB[2] ? -1 : 1;
      }
    } else {
      return matchesA[1] > matchesB[1] ? -1 : 1;
    }
  } else {
    return bVersion.localeCompare(aVersion);
  }
};

module.exports.splitConf = splitConf;

const joinConf = obj => {
  return Object
    .keys(obj)
    .map(key => key + '=' + (obj[key] || ''))
    .join('\n')
    .concat('\n');
};

module.exports.mergeWrite = (filePath, obj) => {
  let fileExists;
  try {
    fs.statSync(filePath);
    fileExists = true;
  } catch(err) {
    fileExists = false;
  }
  if(!fileExists) {
    fs.writeFileSync(filePath, joinConf(obj), 'utf8');
    return;
  }
  const newKeys = Object.keys(obj);
  let usedKeys = new Set();
  const contents = fs.readFileSync(filePath, 'utf8').trim();
  const linePatt = /^(.+)=(.+)$/;
  const splitContents = contents
    .split('\n')
    .map(l => l.trim())
    .map(l => {
      if(!l) { // if it is an empty line
        return l;
      } else if(/^#/.test(l)) { // if it is a comment
        return l;
      } else if(linePatt.test(l)) { // if it is a [key]=[value] line
        const matches = l.match(linePatt);
        const key = matches[1].trim();
        const value = matches[2].trim();
        if(newKeys.includes(key) && usedKeys.has(key)) {
          return '';
        } else if(newKeys.includes(key) && !usedKeys.has(key)) {
          usedKeys = usedKeys.add(key);
          return `${key}=${obj[key]}`;
        } else {
          return `${key}=${value}`;
        }
      } else { // if it is a bad line
        return '';
      }
    });
  for(const key of newKeys) {
    if(usedKeys.has(key)) continue;
    splitContents.push(`${key}=${obj[key]}`);
  }
  const newContents = splitContents
    .join('\n')
    .replace(/[\n\r]{3,}/g, '\n\n')
    .trim();
  fs.writeFileSync(filePath, newContents, 'utf8');
};

module.exports.removeNonWordCharacters = (str = '') => str.replace(/\W/g, '');

class XBridgeConf {

  constructor(address) {
    this._address = address;
    this._data = new Map();
  }

  add(wallet) {
    const { abbr, directory, xBridgeConf, username, password } = wallet;
    if(abbr === 'BLOCK') this._directory = directory;
    const confStr = ipcRenderer.sendSync('getBridgeConf', xBridgeConf);
    if(!confStr) throw new Error(`${xBridgeConf} not found.`);
    const conf = splitConf(confStr);
    this._data.set(abbr, Object.assign({}, conf, {
      Username: username,
      Password: password,
      Address: ''
    }));
  }

  save() {
    const data = [
      [
        '[Main]',
        `ExchangeWallets=${[...this._data.keys()].join(',')}`,
        'FullLog=true'
      ].join('\n'),
      '\n',
      ...[...this._data.entries()]
        .map(([ abbr, conf ]) => {
          return [
            `\n[${abbr}]`,
            joinConf(conf)
          ].join('\n');
        })
    ].join('');
    const confPath = path.join(this._directory, 'xbridge.conf');
    ipcRenderer.send('setXbridgeConfPath', confPath);
    fs.writeFileSync(confPath, data, 'utf8');
    return data;
  }

}

const generateXBridgeConf = wallets => {
  const conf = new XBridgeConf();
  for(const wallet of wallets) {
    conf.add(wallet);
  }
  conf.save();
};

const updateXBridgeConf = (wallets, blockDir) => {
  const data = new Map();
  for(const wallet of wallets) {
    const { abbr, xBridgeConf, username, password } = wallet;
    const confStr = ipcRenderer.sendSync('getBridgeConf', xBridgeConf);
    if(!confStr) throw new Error(`${xBridgeConf} not found.`);
    const conf = splitConf(confStr);
    data.set(abbr, Object.assign({}, conf, {
      Username: username,
      Password: password,
      Address: ''
    }));
  }
  const confPath = path.join(blockDir, 'xbridge.conf');
  const bridgeConf = fs.readFileSync(confPath, 'utf8');
  let split = bridgeConf
    .replace(/\r/g, '')
    .split(/\n/);
  for(const [ abbr, walletData ] of [...data.entries()]) {
    const startIndex = split.findIndex(s => s.trim() === `[${abbr}]`);
    let endIndex;
    for(let i = startIndex + 1; i < split.length; i++) {
      const s = split[i].trim();
      if(!s) {
        endIndex = i - 1;
        break;
      } else if(/^\[.+]$/.test(s)) {
        endIndex = i - 1;
        break;
      } else if(i === split.length - 1) {
        endIndex = i;
      }
    }

    split = [
      ...split.slice(0, startIndex + 1),
      joinConf(walletData),
      ...split.slice(endIndex + 1)
    ];
  }

  const joined = split.join('\n');
  fs.writeFileSync(confPath, joined, 'utf8');
};

const addToXBridgeConf = (wallets, blockDir) => {
  const data = new Map();
  for(const wallet of wallets) {
    const { abbr, xBridgeConf, username, password } = wallet;
    const confStr = ipcRenderer.sendSync('getBridgeConf', xBridgeConf);
    if(!confStr) throw new Error(`${xBridgeConf} not found.`);
    const conf = splitConf(confStr);
    data.set(abbr, Object.assign({}, conf, {
      Username: username,
      Password: password,
      Address: ''
    }));
  }
  const confPath = path.join(blockDir, 'xbridge.conf');
  const bridgeConf = fs.readFileSync(confPath, 'utf8');
  let split = bridgeConf
    .replace(/\r/g, '')
    .split(/\n/);
  const walletsIdx = split.findIndex(s => /^ExchangeWallets\s*=/.test(s));
  const existingWalletList = new Set(split[walletsIdx].trim().split(','));
  const newWalletList = new Set([...data.keys(), ...existingWalletList]);
  newWalletList.delete(''); // Remove empty
  split[walletsIdx] = `ExchangeWallets=${[...newWalletList.values()].join(',')}`;
  for(const [ abbr, walletData ] of [...data.entries()]) {
    split = [
      ...split,
      `\n[${abbr}]`,
      joinConf(walletData)
    ];
  }
  const joined = split.join('\n');
  fs.writeFileSync(confPath, joined, 'utf8');
};

module.exports.saveConfs = wallets => {
  const confs = new Map();
  for(const w of wallets) {
    const conf = w.saveWalletConf();
    confs.set(w.abbr, conf);
  }
  generateXBridgeConf(wallets);
  return confs;
};

const putToXBridgeConf = (wallets, blockDir) => {
  const data = new Map();
  for(const wallet of wallets) {
    const { abbr, xBridgeConf, username, password } = wallet;
    const confStr = ipcRenderer.sendSync('getBridgeConf', xBridgeConf);
    if(!confStr) throw new Error(`${xBridgeConf} not found.`);
    const conf = splitConf(confStr);
    data.set(abbr, Object.assign({}, conf, {
      Username: username,
      Password: password,
      Port: wallet.port || conf.Port,
      Address: ''
    }));
  }
  const confPath = path.join(blockDir, 'xbridge.conf');
  const bridgeConf = fs.readFileSync(confPath, 'utf8');
  let split = bridgeConf
    .replace(/\r/g, '')
    .split(/\n/);
  const walletsIdx = split.findIndex(s => /^ExchangeWallets\s*=/.test(s));
  const walletsRaw = split[walletsIdx].match(/=(.*)$/); // e.g. BLOCK,BTC,LTC or empty
  const walletList = !walletsRaw || walletsRaw.length <= 1 ? [] : walletsRaw[1]
    .split(',')
    .map(str => str.trim());
  const newWalletList = new Set([...walletList, ...(wallets.map(w => w.abbr))]);
  newWalletList.delete(''); // Remove empty
  split[walletsIdx] = `ExchangeWallets=${[...newWalletList.values()].join(',')}`;
  for(const [ abbr, walletData ] of [...data.entries()]) {
    const startIndex = split.findIndex(s => s.trim() === `[${abbr}]`);
    const alreadyInConf = startIndex > -1;
    let endIndex;
    if(alreadyInConf) {
      for (let i = startIndex + 1; i < split.length; i++) {
        const s = split[i].trim();
        if (!s) {
          endIndex = i - 1;
          break;
        } else if (/^\[.+]$/.test(s)) {
          endIndex = i - 1;
          break;
        } else if (i === split.length - 1) {
          endIndex = i;
        }
      }
      split = [
        ...split.slice(0, startIndex + 1),
        joinConf(walletData),
        ...split.slice(endIndex + 1)
      ];
    } else {
      split = [
        ...split,
        `[${abbr}]`,
        joinConf(walletData)
      ];
    }

  }
  const joined = split.join('\n');
  fs.writeFileSync(confPath, joined, 'utf8');
};

/**
 * Adds rpcworkqueue= configuration option to the blocknet.conf. If the current
 * value is under the target it is replaced with the specified minimum value.
 * If the target is over the minimum, the value remains unchanged. If the value
 * is missing, the minimum is used.
 * @param blockDir {string}
 * @param rpcWorkQueueMinimum {number} Default 128
 * @param rpcXBridgeTimeout {number} Default 15
 */
const putBlockConf = (blockDir, rpcWorkQueueMinimum=128, rpcXBridgeTimeout=15) => {
  const blockConf = path.join(blockDir, 'blocknet.conf');
  let data = fs.readFileSync(blockConf, 'utf8');
  let split = data
    .replace(/\r/g, '')
    .split(/\n/);
  const rpcQueueIdx = split.findIndex(s => /^rpcworkqueue\s*=/.test(s));
  if (rpcQueueIdx >= 0) {
    const rpcWQ = split[rpcQueueIdx].match(/=\s*(.*)$/);
    if (!rpcWQ || rpcWQ.length <= 1)
      split[rpcQueueIdx] = `rpcworkqueue=${rpcWorkQueueMinimum}`;
    else { // if entry already has value
      const n = parseInt(rpcWQ[1].trim(), 10);
      if (isNaN(n) || n < rpcWorkQueueMinimum)
        split[rpcQueueIdx] = `rpcworkqueue=${rpcWorkQueueMinimum}`;
      else
        split[rpcQueueIdx] = 'rpcworkqueue=' + n;
    }
  } else {
    // add to front to avoid [test] sections
    split.splice(0, 0, `rpcworkqueue=${rpcWorkQueueMinimum}`);
  }
  const xbridgeTimeoutIdx = split.findIndex(s => /^rpcxbridgetimeout\s*=/.test(s));
  if (xbridgeTimeoutIdx >= 0) {
    const rpcWQ = split[xbridgeTimeoutIdx].match(/=\s*(.*)$/);
    if (!rpcWQ || rpcWQ.length <= 1)
      split[xbridgeTimeoutIdx] = `rpcxbridgetimeout=${rpcXBridgeTimeout}`;
  } else {
    // add to front to avoid [test] sections
    split.splice(0, 0, `rpcxbridgetimeout=${rpcXBridgeTimeout}`);
  }
  // Serialize
  data = split.join('\n');
  fs.writeFileSync(blockConf, data, 'utf8');
};

module.exports.putConfs = (wallets, blockDir, isLitewallets = false) => {
  const confs = new Map();
  if(!isLitewallets) {
    for(const w of wallets) {
      const conf = w.saveWalletConf();
      confs.set(w.abbr, conf);
    }
  }
  putToXBridgeConf(wallets, blockDir);
  putBlockConf(blockDir);
  return confs;
};

module.exports.addConfs = (wallets, blockDir) => {
  const confs = new Map();
  for(const w of wallets) {
    const conf = w.saveWalletConf();
    confs.set(w.abbr, conf);
  }
  addToXBridgeConf(wallets, blockDir);
  return confs;
};

module.exports.updateConfs = (wallets, blockDir) => {
  const confs = new Map();
  for(const w of wallets) {
    const conf = w.saveWalletConf();
    confs.set(w.abbr, conf);
  }
  updateXBridgeConf(wallets, blockDir);
  return confs;
};

module.exports.getDefaultLitewalletConfigDirectory = () => {
  const { app } = remote;
  switch(process.platform) {
    case 'win32':
      return path.join(app.getPath('appData'), 'CloudChains');
    case 'linux':
      return path.join(app.getPath('home'), 'CloudChains');
    default:
      return path.join(app.getPath('appData'), 'CloudChains');
  }
};

module.exports.handleError = err => {
  console.error(err);
  ipcRenderer.send('LOGGER_ERROR', err.message + '\n' + err.stack);
};
