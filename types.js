export type email = {
  dbId: number,
  quartetId: string,
  address: string
}

export type person = {
  dbId: number,
  quartetId: string,
  emailRef: number,
  fullName: string,
  gender: enum,
  phoneNumber: string,
  roles: string
}

export type address = {
  dbId: number,
  quartetId: string,
  city: string,
  lineOne: string,
  lineTwo: string,
  state: enum
}

export type practice = {
  dbId: number,
  quartetId: string,
  NPI: string,
  name: string,
  addresses: Array<number>,
  quartetRegion: number
}

export type account = {
  dbId: number,
  quartetId: string,
  password: string,
  emailRef: number,
  collabRegistrationInst: string
}

export type accountLogin = {
  dbId: number,
  quartetId: string,
  accountRef: number,
  clientId: string
}

export type behavioralProvider = {
  dbId: number,
  quartetId: string,
  personRef: number,
  practicesRefs: Array<number>,
  addressesRefs: Array<number>,
  NPI: string,
  bio: string,
  providerType: enum,
  specialties: Arrray<enum>,
  acceptedInsurance: Array<enum>,
  ageSpecialties: Arrray<enum>,
  languages: Arrray<enum>,
  licenseNumber: string,
  licenseExpirationDate: string,
  tier: number,
  includeInSmartMatch: boolean,
  isQHVerified: boolean,
  acceptedTOSVersion: string,
  acceptedInsurancePlansRef: number
}

export type medicalProvider = {
  dbId: number,
  quartetId: string,
  personRef: number,
  NPI: string,
  practicesRefs: Array<number>,
  addressesRefs: Array<number>
}

export type appPCPuserProfile = {
  dbId: number,
  quartetId: string,
  accountRef: number,
  practiceRef: number,
  isAdmin: boolean,
  practiceTitle: enum,
  permissions: Array<enum>
};

export type patient = {
  dbId: number,
  quartetId: string,
  personRef: number,
  memberId: string,
  address: string,
  primaryInsurancePlanRef: number,
  secondaryInsurancePlanRef: number,
  conditions: Array<enum>
}


export type serviceRequest = {
  dbId: number,
  quartetId: string,
  patientRef: number,
  QHOpsOwnerRef: number,
  requestingMedicalProviderRef: number,
  state: enum,
  smartMatchesRefs: Array<number>,
  notes: string,
  memosRefs: Array<number>,
  needsMedicationManagement: enum,
  isRequestingCurbsideNote: boolean
}

export type serviceRequestMemo = {
  dbId: number,
  quartetId: string,
  note: string
}


export type referral = {
  dbId: number,
  quartetId: string,
  patientRef: number,
  medicalProviderRef: number,
  behavioralProviderRef: number,
  state: enum,
  serviceRequestRef: number,
  medicalProviderNotes: string,
  workflowKey: string,
  apptWorkflowKey: string
}

export type appointment = {
  dbId: number,
  quartetId: string,
  patientRef: number,
  medicalProviderRef: number,
  behavioralProviderRef: number,
  state: enum,
  startTime: string,
  referralRef: number,
  serviceRequestRef: number,
  workflowKey: string,
  hasAttended: boolean
}


export type note = {
  dbId: number,
  quartetId: string,
  authorRef: number,
  text: string
}
