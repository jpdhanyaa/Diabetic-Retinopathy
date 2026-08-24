import React, { useState } from 'react';
import { SimulinkConfig, SimulinkSimulationResults } from '../types/rural';
import { 
  Activity, 
  Cpu, 
  Wifi, 
  Users, 
  Clock, 
  Sliders, 
  Download, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Layers,
  Sparkles
} from 'lucide-react';

export const SimulinkSimulator: React.FC = () => {
  // Simulink Configuration Parameters
  const [config, setConfig] = useState<SimulinkConfig>({
    annualTargetPopulation: 100000,
    mobileUnits: 15,
    dailyAcquisitionsPerUnit: 35,
    bandwidthType: '4G',
    bandwidthMbps: 15,
    imageCompressionRatio: 8,
    aiDeployment: 'Hybrid Edge-Cloud',
    aiInferenceTimeMs: 420,
    ophthalmologistStaffCount: 4,
    autoTriageNormalThreshold: 85,
    doctorReviewTimeSeconds: 26,
  });

  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'simulink_model' | 'matlab_script'>('metrics');

  // Compute Tele-screening Simulation Engine Math
  const computeSimulation = (): SimulinkSimulationResults => {
    const totalDays = 300; // working days / year
    const dailyAcquisitionsTotal = config.mobileUnits * config.dailyAcquisitionsPerUnit;
    const annualScreened = dailyAcquisitionsTotal * totalDays;

    // Bandwidth Transmission Time per image (Assuming 15MB raw -> compressed to 15MB/ratio)
    const imageSizeMB = 15 / config.imageCompressionRatio;
    const transmissionLatencySec = config.aiDeployment === 'Edge (On-Device GPU)' 
      ? 0.05 
      : (imageSizeMB * 8) / (config.bandwidthMbps || 1);

    // AI throughput (Images / hr)
    const aiThroughputPerHour = Math.round(3600 / (config.aiInferenceTimeMs / 1000));

    // Referable cases sent to doctor (100% - Auto-Triage Normal 85% = 15% referable + 5% borderlines = 20%)
    const doctorReferralFraction = (100 - config.autoTriageNormalThreshold) / 100;
    const dailyReferrals = dailyAcquisitionsTotal * doctorReferralFraction;

    // Doctor capacity: (staffCount * 6 hours * 3600 sec) / reviewTime
    const dailyDoctorCapacity = Math.round(
      (config.ophthalmologistStaffCount * 6 * 3600) / config.doctorReviewTimeSeconds
    );
    const doctorWorkloadHoursPerDay = Number(
      ((dailyReferrals * config.doctorReviewTimeSeconds) / (config.ophthalmologistStaffCount * 3600)).toFixed(1)
    );

    // Queue wait time
    let averageQueueWaitDays = 0.1;
    let bottleneck: SimulinkSimulationResults['bottleneckStage'] = 'None (Optimal)';

    if (transmissionLatencySec > 8) {
      bottleneck = 'Bandwidth Transmission';
      averageQueueWaitDays = 1.4;
    } else if (dailyDoctorCapacity < dailyReferrals) {
      bottleneck = 'Ophthalmologist Validation';
      averageQueueWaitDays = Number(((dailyReferrals - dailyDoctorCapacity) / 50 + 2.5).toFixed(1));
    } else if (annualScreened < config.annualTargetPopulation) {
      bottleneck = 'Acquisition';
      averageQueueWaitDays = 0.2;
    }

    // Cost & Impact metrics
    const operationalCostTotal = (config.mobileUnits * 24000) + (config.ophthalmologistStaffCount * 60000) + 18000;
    const costPerPatient = Number((operationalCostTotal / (annualScreened || 1)).toFixed(2));
    const earlySightSaved = Math.round(annualScreened * 0.045); // ~4.5% referable early interventions

    // Hourly Timeline Distribution (8 AM - 5 PM)
    const dailyTimeline = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => {
      const hourlyCaptured = Math.round(dailyAcquisitionsTotal / 9);
      const hourlyAI = Math.min(hourlyCaptured, Math.round(aiThroughputPerHour / 2));
      const hourlyDoc = Math.round(dailyDoctorCapacity / 9);
      const backlog = Math.max(0, hourlyCaptured * 0.2 - hourlyDoc);
      return { hour, captured: hourlyCaptured, processedAI: hourlyAI, reviewedDoc: hourlyDoc, backlog };
    });

    return {
      annualScreenedCapacity: annualScreened,
      averageQueueWaitDays,
      transmissionLatencySec: Number(transmissionLatencySec.toFixed(2)),
      aiProcessingThroughputPerHr: aiThroughputPerHour,
      doctorWorkloadHoursPerDay,
      bottleneckStage: bottleneck,
      costPerPatientUSD: costPerPatient,
      earlySightSavedEstimate: earlySightSaved,
      dailyTimeline,
    };
  };

  const results = computeSimulation();

  const simulinkMatlabCode = `% =========================================================================
% MATLAB Simulink & SimEvents Model: District Tele-Ophthalmology Screening Pipeline
% Models acquisition queues, network bandwidth, AI GPU latency, & HITL doctor capacity
% =========================================================================
function model = buildDistrictTelemedicineSimulink()
    modelName = 'District_DR_Screening_SimEvents';
    close_system(modelName, 0);
    new_system(modelName);
    open_system(modelName);

    % 1. Add SimEvents Entity Generator (Mobile Camp Patient Image Intake)
    add_block('simevents_entities/Entity Generator', [modelName '/MobileVanIntake']);
    set_param([modelName '/MobileVanIntake'], 'InterarrivalTime', 'num2str(3600 / (${config.mobileUnits} * 4))');

    % 2. Network Transmission Channel with Latency & Bandwidth Dropouts
    add_block('simevents_queues/FIFO Queue', [modelName '/NetworkUploadQueue']);
    add_block('simevents_servers/Single Server', [modelName '/CellularUplinkServer']);
    set_param([modelName '/CellularUplinkServer'], 'ServiceTime', '${results.transmissionLatencySec}');

    % 3. Deep Learning Production Server (ResNet-50 Batch Inference)
    add_block('simevents_servers/Parallel Server', [modelName '/AI_Inference_Cluster']);
    set_param([modelName '/AI_Inference_Cluster'], 'NumberOfServers', '4');
    set_param([modelName '/AI_Inference_Cluster'], 'ServiceTime', '${(config.aiInferenceTimeMs / 1000).toFixed(3)}');

    % 4. Automated Triage Routing: Discharges Normal (85%), Routes Level 2+ to MD
    add_block('simevents_routing/Output Switch', [modelName '/TriageRouter']);
    set_param([modelName '/TriageRouter'], 'SwitchingCriterion', 'From attribute');

    % 5. Ophthalmologist Tele-Validation Queue (<30s fast-track)
    add_block('simevents_servers/Parallel Server', [modelName '/SpecialistValidationPool']);
    set_param([modelName '/SpecialistValidationPool'], 'NumberOfServers', '${config.ophthalmologistStaffCount}');
    set_param([modelName '/SpecialistValidationPool'], 'ServiceTime', '${config.doctorReviewTimeSeconds}');

    % 6. Save and Run Dynamic Simulation
    save_system(modelName);
    simResults = sim(modelName, 'StopTime', '300*8*3600');
    fprintf('Simulink Model Compiled: Annual Patient Throughput = %d\\n', ${results.annualScreenedCapacity});
end`;

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Pillar 5: Simulink Discrete-Event Telemedicine Workflow Simulation
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                Simulink • SimEvents & Optimization Toolbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Models acquisition queues, network bandwidth, AI inference clusters, and doctor validation capacity for 100,000+ patients
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('metrics')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Workflow Performance
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('simulink_model')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'simulink_model'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulink Block Diagram
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matlab_script')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeSubTab === 'matlab_script'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>.slx Script</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          
          {/* Top KPI Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Annual Screened */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Annual Screened</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-slate-100 font-mono">
                {results.annualScreenedCapacity.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-400 font-bold">
                {results.annualScreenedCapacity >= config.annualTargetPopulation ? '✓ Target Achieved (>100k)' : '⚠️ Below Target'}
              </p>
            </div>

            {/* Average Turnaround Time */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Average Turnaround</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-slate-100 font-mono">
                {results.averageQueueWaitDays} Days
              </div>
              <p className="text-[11px] text-slate-400">
                AI Triage + Fast Doctor Sign-Off
              </p>
            </div>

            {/* Cost Per Patient */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Cost Per Screened Patient</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${results.costPerPatientUSD}
              </div>
              <p className="text-[11px] text-slate-500">
                Optimized rural tele-triage
              </p>
            </div>

            {/* Bottleneck Status */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Pipeline Bottleneck</span>
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-sm font-black text-rose-300">
                {results.bottleneckStage}
              </div>
              <p className="text-[11px] text-slate-500">
                {results.earlySightSavedEstimate} High-risk sights preserved
              </p>
            </div>
          </div>

          {/* Interactive Parameter Control Sliders */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Simulink Tele-Ophthalmology Resource Allocation Sliders</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              {/* Column 1: Image Acquisition Setup */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1.5">
                  1. Mobile Vans & PHCs
                </span>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Active Mobile Clinic Vans:</span>
                    <span className="font-mono text-indigo-300 font-bold">{config.mobileUnits} units</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={config.mobileUnits}
                    onChange={(e) => setConfig({ ...config, mobileUnits: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Daily Tests Per Van:</span>
                    <span className="font-mono text-indigo-300 font-bold">{config.dailyAcquisitionsPerUnit} pts/day</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={config.dailyAcquisitionsPerUnit}
                    onChange={(e) => setConfig({ ...config, dailyAcquisitionsPerUnit: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Column 2: Bandwidth & AI Cloud Inference */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1.5">
                  2. Rural Connectivity & AI Cluster
                </span>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Cellular Bandwidth:</span>
                    <span className="font-mono text-sky-300 font-bold">{config.bandwidthMbps} Mbps</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="2"
                    value={config.bandwidthMbps}
                    onChange={(e) => setConfig({ ...config, bandwidthMbps: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Auto-Triage Normal Filter:</span>
                    <span className="font-mono text-emerald-300 font-bold">{config.autoTriageNormalThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="5"
                    value={config.autoTriageNormalThreshold}
                    onChange={(e) => setConfig({ ...config, autoTriageNormalThreshold: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Column 3: Ophthalmologist Fast-Track Review Team */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1.5">
                  3. Retina Specialists (HITL Pool)
                </span>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Ophthalmologist Count:</span>
                    <span className="font-mono text-amber-300 font-bold">{config.ophthalmologistStaffCount} Doctors</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={config.ophthalmologistStaffCount}
                    onChange={(e) => setConfig({ ...config, ophthalmologistStaffCount: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Fast Sign-Off Time / Case:</span>
                    <span className="font-mono text-amber-300 font-bold">{config.doctorReviewTimeSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="2"
                    value={config.doctorReviewTimeSeconds}
                    onChange={(e) => setConfig({ ...config, doctorReviewTimeSeconds: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Simulink Block Diagram Visual Architecture */}
      {activeSubTab === 'simulink_model' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Simulink Tele-Ophthalmology Block Diagram Architecture</span>
            </span>
            <span className="text-xs font-mono text-emerald-400">SimEvents 2026b Discrete-Event Network</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <div className="min-w-[650px] flex items-center justify-between gap-4 py-6">
              
              {/* Block 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-indigo-500/60 text-center space-y-1 w-44 shadow-lg">
                <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">SimEvents Generator</div>
                <div className="text-xs font-bold text-slate-100">Mobile Camp Intake</div>
                <p className="text-[10px] text-slate-400">{config.mobileUnits} Vans • {config.dailyAcquisitionsPerUnit} pts/day</p>
              </div>

              <div className="text-slate-600 font-bold">→</div>

              {/* Block 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-sky-500/60 text-center space-y-1 w-44 shadow-lg">
                <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">Channel Delay Queue</div>
                <div className="text-xs font-bold text-slate-100">{config.bandwidthType} Uplink</div>
                <p className="text-[10px] text-slate-400">{config.bandwidthMbps} Mbps • {results.transmissionLatencySec}s delay</p>
              </div>

              <div className="text-slate-600 font-bold">→</div>

              {/* Block 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-emerald-500/60 text-center space-y-1 w-44 shadow-lg">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Parallel Server</div>
                <div className="text-xs font-bold text-slate-100">AI ResNet-50 Hub</div>
                <p className="text-[10px] text-slate-400">{results.aiProcessingThroughputPerHr} imgs/hr • {config.autoTriageNormalThreshold}% Normal</p>
              </div>

              <div className="text-slate-600 font-bold">→</div>

              {/* Block 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/60 text-center space-y-1 w-44 shadow-lg">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">HITL Server Pool</div>
                <div className="text-xs font-bold text-slate-100">Doctor Validation</div>
                <p className="text-[10px] text-slate-400">{config.ophthalmologistStaffCount} MDs • {config.doctorReviewTimeSeconds}s fast-sign</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MATLAB Script Generator */}
      {activeSubTab === 'matlab_script' && (
        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 max-h-[380px] overflow-y-auto shadow-inner">
          <pre>{simulinkMatlabCode}</pre>
        </div>
      )}
    </div>
  );
};
