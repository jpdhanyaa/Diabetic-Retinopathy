import { ScreeningHistoryRecord } from '../types/rural';
import { PRESET_SCANS } from './sampleScans';

export const INITIAL_HISTORY_RECORDS: ScreeningHistoryRecord[] = [
  {
    id: 'REC-082401',
    date: '24 Aug 2026',
    patientName: 'Ramesh Patel',
    age: 54,
    gender: 'Male',
    village: 'Rampur Khurd',
    phone: '9845012345',
    eye: 'OD',
    sugarLevel: '168 mg/dL',
    diabetesDuration: '8 Years',
    predictedStage: 2,
    stageName: 'Moderate Non-Proliferative Retinopathy',
    stageConfidence: 94.2,
    dmeStatus: 'center_involved',
    urgency: 'moderate',
    followUpText: 'Ophthalmologist referral within 1 month; OCT indicated',
    imageUrl: PRESET_SCANS[2].imageUrl,
    healthWorkerName: 'Sunita Devi (ASHA)',
    centerName: 'Rampur Primary Health Centre',
    adviceGiven: [
      'Take diabetes tablets on time daily',
      'Keep fasting blood sugar below 130 mg/dL',
      'Walk 30 minutes every morning',
      'Visit District Eye Hospital within 1 month'
    ]
  },
  {
    id: 'REC-082398',
    date: '23 Aug 2026',
    patientName: 'Shanti Devi',
    age: 62,
    gender: 'Female',
    village: 'Bishanpur',
    phone: '9871122334',
    eye: 'OS',
    sugarLevel: '210 mg/dL',
    diabetesDuration: '14 Years',
    predictedStage: 3,
    stageName: 'Severe Non-Proliferative Retinopathy',
    stageConfidence: 96.8,
    dmeStatus: 'center_involved',
    urgency: 'high',
    followUpText: 'Urgent retinal specialist evaluation within 2–4 weeks',
    imageUrl: PRESET_SCANS[3].imageUrl,
    healthWorkerName: 'Sunita Devi (ASHA)',
    centerName: 'Rampur Primary Health Centre',
    adviceGiven: [
      'Strict insulin adherence and glucose logs',
      'Emergency referral to Medical College Ophthalmology OPD',
      'Avoid heavy weight lifting and strain'
    ]
  },
  {
    id: 'REC-082215',
    date: '22 Aug 2026',
    patientName: 'Mukesh Kumar',
    age: 48,
    gender: 'Male',
    village: 'Haripura Gram',
    phone: '9812304958',
    eye: 'OD',
    sugarLevel: '124 mg/dL',
    diabetesDuration: '3 Years',
    predictedStage: 0,
    stageName: 'No Apparent Diabetic Retinopathy',
    stageConfidence: 99.1,
    dmeStatus: 'none',
    urgency: 'routine',
    followUpText: 'Annual tele-retinal screening in 12 months',
    imageUrl: PRESET_SCANS[0].imageUrl,
    healthWorkerName: 'Rajesh Sharma (CHO)',
    centerName: 'Haripura Sub-Center',
    adviceGiven: [
      'Healthy diet and regular morning walk',
      'Routine annual screening in 1 year',
      'Keep HbA1c below 7.0%'
    ]
  },
  {
    id: 'REC-082042',
    date: '20 Aug 2026',
    patientName: 'Kaveri Bai',
    age: 58,
    gender: 'Female',
    village: 'Chitrakoot Tola',
    phone: '9765412389',
    eye: 'OS',
    sugarLevel: '145 mg/dL',
    diabetesDuration: '6 Years',
    predictedStage: 1,
    stageName: 'Mild Non-Proliferative Retinopathy',
    stageConfidence: 91.5,
    dmeStatus: 'none',
    urgency: 'routine',
    followUpText: 'Repeat tele-screening in 6–12 months with strict HbA1c control',
    imageUrl: PRESET_SCANS[1].imageUrl,
    healthWorkerName: 'Sunita Devi (ASHA)',
    centerName: 'Rampur Primary Health Centre',
    adviceGiven: [
      'Control fasting sugar and blood pressure',
      'Re-examine retina in 6 months at PHC',
      'Reduce salt and fried snacks'
    ]
  }
];
