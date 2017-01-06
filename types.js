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
  roles: string
}

export type account = {
  dbId: number,
  quartetId: string,
  password: string,
  emailRef: number,
  collabRegistrationInst: string
}
