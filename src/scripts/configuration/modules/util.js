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

module.exports.removeNonWordCharacters = (str = '') => str.replace(/\W/g, '');
