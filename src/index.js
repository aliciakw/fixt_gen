import "babel-core";
import uuidV4 from 'uuid/v4';

import {
  pickRandom,
  pickRandomGroup,
  randomDigit,
  randomNumberString,
  randomName
} from './randomizers'
import generateFinalFixtures from './ednize';

// utilize enums endpoint if one becomes available
import providerEnums from './provider-enums';
import personEnums from './person-enums';
import referralEnums from './referral-enums';
import stateEnums from './us-state-enums';
import { firstNames, lastNames, bios, streets, cities, practiceNames } from './text';

//
// constants
//

let dbIndex = 1;
const username = process.argv[2] || 'dev';
const emailAt = '@quartethealth.com',
      apps = ['bhp', 'admin', 'pcp', 'patient'],
      abbrevs = {
        bhp: 'behavioralHealthProvider',
        pcp: 'medicalProvider',
        admin: 'admin',
        patient: 'patient'
      },
      models = {
        'email': [],
        'person': [],
        'account': [],
        'account.login': [],
        'behavioralProvider': [],
        'medicalProvider': [],
        'app.PCP.userProfile': [],
        'patient': [],
        'practice': [],
        'address': [],
        'quartetRegion': [],
        'serviceRequest': [],
        'referral': []
      };

//
// generators
//

const getDbId = () => {
  const dbId = dbIndex;
  dbIndex++;
  return dbId;
};

const generateEmail = (username, label='') => {
  if (label) { label = '+' + label; }
  const dbId = getDbId();
  models['email'].push ({
    dbId,
    quartetId: uuidV4(),
    address: username + label + emailAt
  });

  return dbId
};

const generatePerson = (emailRef, appName) => {
  const dbId = getDbId();
  models['person'].push({
    dbId,
    quartetId: uuidV4(),
    emailRef,
    fullName: randomName(firstNames, lastNames),
    gender: pickRandom(personEnums.genders),
    phoneNumber: randomNumberString(10),
    roles: [('person.role/' + abbrevs[appName])]
  });
  return dbId;
};

const generateRegion = name => {
  const dbId = getDbId();
  models['quartetRegion'].push({
    dbId,
    quartetId: uuidV4(),
    name
  });
  return dbId;
};

const generateAddress = () => {
  const dbId = getDbId();
  models['address'].push({
    dbId,
    quartetId: uuidV4(),
    city: pickRandom(cities),
    lineOne: Math.ceil(Math.random() * 1000).toString() + ' ' + pickRandom(streets),
    state: pickRandom(Object.keys(stateEnums))
  });
  return dbId;
};

const generatePractice = addressRef => {
  const dbId = getDbId();
  models['practice'].push({
    dbId,
    quartetId: uuidV4(),
    NPI: randomNumberString(5),
    name: pickRandom(practiceNames),
    addresses: [addressRef],
    //quartetRegion: number
  });
  return dbId;
};

const password = 'pbkdf2_sha256$24000$5fCrzejhti9K$79XrYIq99uJgEpgxYhCypDCgyCfkIHU6WrtsZUBl1sM=',
      collabRegistrationInst = '2015-06-06T15:31:29.331',
      clientId = 'fancy_and_definitely_real_client_id',
      workflowKey = 'fake|||workflow|||key',
      apptWorkflowKey = 'fake|||apptWorkflowKey|||key';

const generateAccount = (emailRef, personRef) => {
  const accountDbId = getDbId();
  const accountLoginDbId = getDbId();
  models['account'].push({
    dbId: accountDbId,
    quartetId: uuidV4(),
    password,
    emailRef,
    personRef,
    collabRegistrationInst
  });

  models['account.login'].push({
    dbId: accountLoginDbId,
    quartetId: uuidV4(),
    accountRef: accountDbId,
    clientId
  });

  return accountDbId;
};

const generateBhp = personRef => {
  const dbId = getDbId();
  const addressRef = generateAddress();
  const practiceRef = generatePractice(addressRef);

  models['behavioralProvider'].push({
    dbId,
    quartetId: uuidV4(),
    personRef,
    addressesRefs: [addressRef],
    practicesRefs: [practiceRef],
    NPI: randomNumberString(10),
    bio: pickRandom(bios),
    providerType: pickRandom(providerEnums.providerTypes),
    specialties: pickRandomGroup(providerEnums.conditions, 3),
    acceptedInsurance: pickRandomGroup(providerEnums.insurances, 5),
    ageSpecialties: pickRandomGroup(providerEnums.ageSpecialties, 2),
    languages: pickRandomGroup(providerEnums.languages, 3),
    licenseNumber: '1234-567-89000',
    licenseExpirationDate: '2020-01-01T00:00:00.000',
    tier: Math.ceil(Math.random() * 3),
    includeInSmartMatch: true,
    isQHVerified: true,
    acceptedTOSVersion: '0.0.0',
    // acceptedInsurancePlansRef: number
  });
}

const generatePcp = (personRef, accountRef) => {
  const pcpDbId = getDbId();
  const userProfileDbId = getDbId();
  const addressRef = generateAddress();
  const practiceRef = generatePractice(addressRef);

  models['medicalProvider'].push({
    dbId: pcpDbId,
    quartetId: uuidV4(),
    personRef,
    NPI: randomNumberString(10),
    addressesRefs: [addressRef],
    practicesRefs: [practiceRef]
  });

  models['app.PCP.userProfile'].push({
    dbId: userProfileDbId,
    quartetId: uuidV4(),
    accountRef,
    practiceRef,
    isAdmin: true,
    practiceTitle: pickRandom(providerEnums.practiceTitle),
    permissions: providerEnums.pcpPermissions
  });
};

const generatePatient = personRef => {
  const dbId = getDbId();
  const addressRef = generateAddress();
  models['patient'].push({
    dbId,
    quartetId: uuidV4(),
    personRef,
    addressRef,
    memberId: randomNumberString(5),
    //primaryInsurancePlanRef: number,
    //secondaryInsurancePlanRef: number,
    conditions: pickRandomGroup(providerEnums.conditions, 3)
  });
};

const generateAppAcct = (appName) => {
  const emailRef = generateEmail(username, appName);
  const personRef = generatePerson(emailRef, appName);
  const accountRef = generateAccount(emailRef, personRef);
  let addressRef, practiceRef;

  switch (appName) {
    case 'bhp':
      generateBhp(personRef, addressRef, practiceRef);
      break;
    case 'pcp':
      generatePcp(personRef, accountRef);
      break;
    case 'patient':
      generatePatient(personRef);
      break;
  }

  return;
}

const generateSR = (patientRef, requestingMedicalProviderRef, state) => {
  const dbId = getDbId();
  models['serviceRequest'].push({
    dbId,
    quartetId: uuidV4(),
    patientRef,
    //QHOpsOwnerRef: number,
    requestingMedicalProviderRef,
    state,
    //smartMatchesRefs: Array<number>,
    notes: 'This is a new serviceRequest',
    needsMedicationManagement: 'serviceRequest.needsMedicationManagement/no',
    isRequestingCurbsideNote: false
  });
  return dbId;
};

const generateReferral = (patientRef, requestingMedicalProviderRef, serviceRequestRef, behavioralProviderRef) => {
  const dbId = getDbId();
  models['referral'].push({
    dbId,
    quartetId: uuidV4(),
    patientRef,
    requestingMedicalProviderRef,
    behavioralProviderRef,
    state: 'pendingProviderResponse',
    serviceRequestRef,
    medicalProviderNotes: 'Some notes from the PCP',
    workflowKey,
    apptWorkflowKey
  });
  return dbId;
};

const bulkGenerate = (objType, times) => {
  let emailRef, personRef, generate;
  switch (objType) {
    case 'patient':
      generate = () => {
        emailRef = generateEmail('patient' + i);
        personRef = generatePerson(emailRef, 'patient');
        generatePatient(personRef);
      };
      break;
    case 'bhp':
      generate = () => {
        emailRef = generateEmail('patient' + i);
        personRef = generatePerson(emailRef, 'patient');
        generateBhp(personRef);
      };
      break;
  }

  for (var i = 1; i <= times; i++) {
    generate();
  }
}

const generateAppAccounts = () => {
  apps.forEach(appName => {
    generateAppAcct(appName);
  });
};



//
// generate the data already!
//

providerEnums.regions.forEach(region => generateRegion(region));
generateAppAccounts();

// additional patients
bulkGenerate('patient', 3);
// additional bhps
bulkGenerate('bhp', 3);

models['behavioralProvider'].forEach(bhp => {
  const bhpId = bhp.dbId;
  models['patient'].forEach((patient, i) => {
    if (i % 2) {
      const srId = generateSR(patient.dbId, models['medicalProvider'][0].dbId, 'serviceRequest.state/matched');
      generateReferral(patient.dbId, models['medicalProvider'][0].dbId, srId);
    } else {
      generateSR(patient.dbId, models['medicalProvider'][0].dbId, 'serviceRequest.state/created');
    }

  });
});

generateFinalFixtures(models);

console.log('done.');
