const fs = require('fs');

module.exports.sortByVersion = arr => [...arr]
  .sort((a, b) => {
    const splitA = a.split('.');
    const splitB = b.split('.');
    for(let i = 0; i < 3; i++) {
      splitA[i] = Number(splitA[i]) || 0;
      splitB[i] = Number(splitB[i]) || 0;
    }
    if(splitA[0] === splitB[0]) {
      if(splitA[1] === splitB[1]) {
        if(splitA[2] === splitB[2]) {
          return 0;
        } else {
          return splitA[2] > splitB[2] ? 1 : -1;
        }
      } else {
        return splitA[1] > splitB[1] ? 1 : -1;
      }
    } else {
      return splitA[0] > splitB[0] ? 1 : -1;
    }
  });

module.exports.splitConf = (str = '') => {
  return str
    .split('\n')
    .map(s => s.trim())
    .filter(l => l ? true : false)
    .map(l => l.split('=').map(s => s.trim()))
    .reduce((obj, [key, val = '']) => {
      if(key && val) return Object.assign({}, obj, {[key]: val});
      else return obj;
    }, {});
};

const joinConf = obj => {
  return Object
    .keys(obj)
    .map(key => key + '=' + (obj[key] || ''))
    .join('\n')
    .concat('\n');
};
module.exports.joinConf = joinConf;

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
