import { jsPDF } from 'jspdf';
import { ScreeningHistoryRecord } from '../types/rural';

export const generatePatientReportPDF = (record: ScreeningHistoryRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
  
  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 40, pageWidth, 2, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RURAL DIABETIC EYE SCREENING REPORT', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Tele-Ophthalmology Mission • MATLAB Preprocessed & AI Classified', 14, 23);
  doc.text(`Center: ${record.centerName}  |  Health Worker: ${record.healthWorkerName}`, 14, 30);
  doc.text(`Date of Examination: ${record.date}  |  Report ID: #${record.id}`, 14, 36);

  // 2. Patient Demographics Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 48, pageWidth - 28, 38, 3, 3, 'FD');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 48, pageWidth - 28, 38, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PATIENT DEMOGRAPHICS & CLINICAL HISTORY', 18, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  // Col 1
  doc.text(`Patient Name: ${record.patientName}`, 18, 64);
  doc.text(`Age / Gender: ${record.age} Years / ${record.gender}`, 18, 71);
  doc.text(`Village / Area: ${record.village}`, 18, 78);

  // Col 2
  const col2X = 110;
  doc.text(`Mobile: ${record.phone || 'Not Provided'}`, col2X, 64);
  doc.text(`Tested Eye: ${record.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, col2X, 71);
  doc.text(`Sugar / Diabetes: ${record.sugarLevel} (${record.diabetesDuration})`, col2X, 78);

  // 3. Screening Diagnosis Result Banner (Traffic Light Style)
  let statusColor: [number, number, number] = [16, 185, 129]; // Emerald
  let bgStatusColor: [number, number, number] = [236, 253, 245]; // light emerald
  let statusLabel = 'NO DIABETIC RETINOPATHY DETECTED (NORMAL)';

  if (record.predictedStage === 1) {
    statusColor = [217, 119, 6]; // Amber
    bgStatusColor = [254, 243, 199];
    statusLabel = 'MILD NON-PROLIFERATIVE DIABETIC RETINOPATHY';
  } else if (record.predictedStage === 2) {
    statusColor = [234, 88, 12]; // Orange
    bgStatusColor = [255, 237, 213];
    statusLabel = 'MODERATE NPDR (EVIDENCE OF VASCULAR LEAKAGE)';
  } else if (record.predictedStage >= 3) {
    statusColor = [220, 38, 38]; // Red
    bgStatusColor = [254, 226, 226];
    statusLabel = 'SEVERE / PROLIFERATIVE DIABETIC RETINOPATHY (HIGH RISK)';
  }

  doc.setFillColor(bgStatusColor[0], bgStatusColor[1], bgStatusColor[2]);
  doc.roundedRect(14, 92, pageWidth - 28, 42, 3, 3, 'FD');
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 92, pageWidth - 28, 42, 3, 3, 'S');

  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`DIAGNOSIS: ${statusLabel}`, 18, 102);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`• ICDR Classification: ${record.stageName} (Confidence: ${record.stageConfidence}%)`, 18, 111);
  doc.text(`• Macular Edema (DME) Status: ${record.dmeStatus === 'none' ? 'No Diabetic Macular Edema' : 'Diabetic Macular Edema (DME) Detected'}`, 18, 118);
  doc.text(`• Urgency Level: ${record.urgency.toUpperCase()}  |  Recommended Action: ${record.followUpText}`, 18, 125);

  // 4. Processing & Pipeline Details Card
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(14, 140, pageWidth - 28, 28, 3, 3, 'FD');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(14, 140, pageWidth - 28, 28, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('IMAGE PREPROCESSING & ARTIFICIAL INTELLIGENCE PIPELINE', 18, 147);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. MATLAB 2026b Vision: Green Channel Extraction (rgb2gray), Contrast-Limited Adaptive Histogram (CLAHE)', 18, 154);
  doc.text('2. Morphological Top-Hat & Bottom-Hat Filters for Microaneurysm & Lipid Exudate Isolation', 18, 159);
  doc.text('3. Deep Convolutional Neural Network (ResNet-50 / EfficientNet) + Random Forest Ensemble Model', 18, 164);

  // 5. Plain Patient Health Advice
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 174, pageWidth - 28, 48, 3, 3, 'FD');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 174, pageWidth - 28, 48, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('ACTIONABLE HEALTH ADVICE FOR PATIENT & FAMILY', 18, 182);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('1. Daily Medication: Take prescribed diabetes tablets or insulin on time without missing doses.', 18, 190);
  doc.text('2. Blood Sugar Goal: Maintain fasting blood sugar below 130 mg/dL and post-meal below 180 mg/dL.', 18, 196);
  doc.text('3. Diet & Exercise: Limit white sugar, sweets, and refined grains. Walk 30 minutes every morning.', 18, 202);
  doc.text(`4. Follow-up Care: ${record.followUpText} at the nearest Community Vision Center / District Hospital.`, 18, 208);
  doc.text('5. Emergency Signs: If sudden vision darkness, flashes, or black floaters appear, seek emergency eye care.', 18, 214);

  // 6. Signatures & Verification Block
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 240, pageWidth - 14, 240);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Health Worker / Screener Signature:', 18, 250);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${record.healthWorkerName} (${record.centerName})`, 18, 256);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Referring Medical Officer / Doctor Signature:', 110, 250);
  doc.text('_____________________________________', 110, 256);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This AI & MATLAB assisted screening slip is an aid for early triage in rural health setups. Confirmatory dilated slit-lamp fundus examination is recommended.',
    14,
    275,
    { maxWidth: pageWidth - 28 }
  );

  // Save the PDF
  const cleanName = record.patientName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Diabetic_Retinopathy_Report_${cleanName}_${record.id}.pdf`);
};
