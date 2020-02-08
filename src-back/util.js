const splitConf = (str = '') => {
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

module.exports = {
  splitConf
};
