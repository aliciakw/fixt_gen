const pickRandom = arr => {
  if (arr) {
    const position = Math.ceil(arr.length * Math.random()) - 1;
    return arr[position];
  }
};

const pickRandomGroup = (arr, max) => {
  let groupSize = Math.ceil(Math.random() * max);
  let pick, randomGroup = [];
  for (var i = 0; i < groupSize; i++) {
    pick = pickRandom(arr);
    arr.splice(arr.indexOf(pick), 1);
    randomGroup.push(pick);
  }
  return randomGroup;
};

const randomDigit = () => Math.floor(Math.random() * 10);

const randomNumberString = len => new Array(len).fill(1).map(i => randomDigit()).toString().replace(/\,/g, '');

const randomName = (firstNames, lastNames) => {
  const first = pickRandom(firstNames);
  const last = pickRandom(lastNames);
  return first + ' ' + last;
};

export default {
  pickRandom,
  pickRandomGroup,
  randomDigit,
  randomNumberString,
  randomName
};
