const serviceRequestStates = {
  "serviceRequest.state/created": "Initiating referral",
  "serviceRequest.state/matching": "Matching",
  "serviceRequest.state/matched": "Matched",
  "serviceRequest.state/patientRejected": "Patient declined care",
  "serviceRequest.state/patientUnresponsive": "Patient unreachable",
  "serviceRequest.state/referredOutside": "Referred to outside provider"
};

const referralStates = {
  "referral.state/declinedProviderUnresponsive": "Declined - Provider Unresponsive",
  "referral.state/declinedQHToIntervene": "Declined - Quartet to Intervene",
  "referral.state/pendingProviderReachingOut": "Provider Reaching Out",
  "referral.state/pendingProviderResponse": "Pending Provider Response",
  "referral.state/providerAcceptedReferral": "Provider Accepted Referral",
  "referral.state/scheduledAppointmentMade": "Appointment Scheduled"
};

const declineReferralStates = {
  "referral.declineReason/other": "Other",
  "referral.declineReason/patientContactInfoIsIncorrect": "Patient contact info is incorrect",
  "referral.declineReason/patientInsuranceDidNotMatch": "Patient insurance didn\'t match",
  "referral.declineReason/patientIsNotInterested": "Patient is not interested",
  "referral.declineReason/patientIsNotReturningContact": "Patient is not returning contact",
  "referral.declineReason/patientIsTooFarAway": "Patient is too far away"
};

const suggestedPatientDeclineStates = {
  "suggestedPatient.declinedReason/alreadyReferredToBHP": "Patient already referred to BHP",
  "suggestedPatient.declinedReason/alreadySeeingBHP": "Patient already seeing BHP",
  "suggestedPatient.declinedReason/conditionTooSevere": "Patient's condition is too severe",
  "suggestedPatient.declinedReason/deceased": "Patient is deceased",
  "suggestedPatient.declinedReason/doesNotRequireBHC": "Patient does not require BH care",
  "suggestedPatient.declinedReason/inLongTermCare": "Patient is in long term care",
  "suggestedPatient.declinedReason/noLongerMyPatient": "Patient no longer mine",
  "suggestedPatient.declinedReason/notMyPatient": "Patient is not mine",
  "suggestedPatient.declinedReason/tooOldForBHC": "Patient is too old for BH care",
  "suggestedPatient.declinedReason/other": "Other",
};

const appointmentStates = {
  "appointment.state/canceled": "Appointment cancelled",
  "appointment.state/missedQHToIntervene": "Appointment missed",
  "appointment.state/occurredProviderFollowupSent": "Consult note available",
  "appointment.state/occurredPatientFollowupSent": "Patient note sent",
  "appointment.state/scheduled": "Appointment scheduled"
};

const assessmentTypes = {
  "serviceRequest.requestAssessmentType/audit": "AUDIT",
  "serviceRequest.requestAssessmentType/comprehensive": "Comprehensive",
  "serviceRequest.requestAssessmentType/GAD7": "GAD-7",
  "serviceRequest.requestAssessmentType/PHQ9": "PHQ-9"
};



export default {
  serviceRequestStates,
  referralStates,
  declineReferralStates,
  suggestedPatientDeclineStates,
  appointmentStates,
  assessmentTypes
}
