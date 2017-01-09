const fs = require('fs');

//
// constants
//

const refRegex = /Ref/;
const dateInstRegex = /\d{4}-\d{2}-\d{2}/;
const enumRegex = /\w+\/\w+/;

//
// helpers
//

const assignDbId = (dbid) => ':db/id           #db/id[:db.part/user -'+ dbid +']';
const assignUUIDAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #uuid \"' + val + '\"';
const assignEnumAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' :' + val ;
const assignMultiEnumAttr = (model, attr, val) => {
  let ednVal = val.map(i => ':' + i).toString().replace(/\,/g, ' ');
  return '\n :' + model + '/' + attr + ' [' + ednVal + ']';
}
const assignInstAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #inst \"' + val + '\"';
const assignRefAttr = (model, attr, val) => {
  return '\n :' + model.replace('Ref', '') + '/' + attr + ' #db/id[:db.part/user -' + val + ']';
}
const assignAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' ' + val;
const assignStringAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' \"' + val + '\"';


//                                            //
//        write js data object as edn         //
//                                            //

const printAttrAsEdn = (model, attr, data) => {
  if (attr === 'dbId') {
    return assignDbId(data);
  } else if (attr === 'quartetId') {
    return assignUUIDAttr(model, attr, data);
  } else if (typeof data === 'object' && enumRegex.test(data)) {
    return assignMultiEnumAttr(model, attr, data);
  } else if (enumRegex.test(data)) {
    return assignEnumAttr(model, attr, data);
  } else if (refRegex.test(attr)) {
    return assignRefAttr(model, attr, data);
  } else if (dateInstRegex.test(data)) {
    return assignInstAttr(model, attr, data);
  } else if (typeof data === 'number' || typeof data === 'boolean' ) {
    return assignAttr(model, attr, data);
  } else {
    return assignStringAttr(model, attr, data);
  }
  return '';
}

let edn;
const recordAsEdn = (model, record) => {
  const attributes = Object.keys(record);
  edn = '{';

  attributes.forEach(attr => {
    edn += printAttrAsEdn(model, attr, record[attr]);
  });

  return edn + '}\n';
}

let data;
const generateFinalFixtures = (fixtures, fileName='fixtures') => {
  const fixt_file = fs.createWriteStream(__dirname + '/../' + fileName + '.edn', {flags : 'w'});
  const modelNames = Object.keys(fixtures);
  modelNames.forEach((modelName) => {
    data = fixtures[modelName];
    fixt_file.write(';; ' + modelName + 's \n');
    data.forEach(record => {
      fixt_file.write(recordAsEdn(modelName, record));
    });
    fixt_file.write('\n');
  });
};

export default generateFinalFixtures;
