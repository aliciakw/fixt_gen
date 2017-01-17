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

const assignDbId = (dbid) => `:db/id           #db/id[:db.part/user -${dbid}]`;
const assignUUIDAttr = (model, attr, val) => `\n :${model}/${attr} #uuid "${val}"`;
const assignInstAttr = (model, attr, val) => `\n :${model}/${attr} #inst "${val}"`;

const assignEnumAttr = (model, attr, val) => `\n :${model}/${attr} :${val}`;
const assignMultiEnumAttr = (model, attr, val) => {
  let ednVal = val.map(i => `:${i}`).toString().replace(/\,/g, ' ');
  return `\n :${model}/${attr} [${ednVal}]`;
}
const assignRefAttr = (model, attr, val) => `\n :${model}/${attr.replace('Ref', '')} #db/id[:db.part/user -${val}]`;
const assignMultiRefAttr = (model, attr, val) => {
  let refVal = val.map(i => `#db/id[:db.part/user -${i}]`).toString().replace(/\,/g, ' ');
  return `\n :${model}/${attr.replace('Refs', '')} [${refVal}]`;
}
const assignAttr = (model, attr, val) => `\n :${model}/${attr} ${val}`;
const assignStringAttr = (model, attr, val) => `\n :${model}/${attr} "${val}"`;


//                                            //
//        write js data object as edn         //
//                                            //

const printAttrAsEdn = (model, attr, data) => {
  switch (typeof data) {
    case 'object':
      if (enumRegex.test(data)) { return assignMultiEnumAttr(model, attr, data); }
      if (refRegex.test(attr)) { return assignMultiRefAttr(model, attr, data); }

      return [];
      break;

    case 'number':
      if (attr === 'dbId') { return assignDbId(data); }
      if (refRegex.test(attr)) { return assignRefAttr(model, attr, data); }

      return assignAttr(model, attr, data);
      break;

    case 'string':
      if (attr === 'quartetId') { return assignUUIDAttr(model, attr, data); }
      if (refRegex.test(attr)) { return assignRefAttr(model, attr, data); }
      if (enumRegex.test(data)) { return assignEnumAttr(model, attr, data); }
      if (dateInstRegex.test(data)) { return assignInstAttr(model, attr, data); }

      return assignStringAttr(model, attr, data);
      break;

    default:
      return assignAttr(model, attr, data);
      break;
  }
}

let edn;
const recordAsEdn = (model, record) => {
  const attributes = Object.keys(record);
  edn = '{';

  attributes.forEach(attr => {
    edn += printAttrAsEdn(model, attr, record[attr]);
  });

  return `${edn}}\n`;
}

let data;
const generateFinalFixtures = (fixtures, fileName='fixtures') => {
  const fixt_file = fs.createWriteStream(`${__dirname}/../${fileName}.edn`, {flags : 'w'});
  const modelNames = Object.keys(fixtures);
  modelNames.forEach((modelName) => {
    data = fixtures[modelName];
    fixt_file.write(`;; ${modelName}s \n`);
    data.forEach(record => {
      fixt_file.write(recordAsEdn(modelName, record));
    });
    fixt_file.write('\n');
  });
};

export default generateFinalFixtures;
