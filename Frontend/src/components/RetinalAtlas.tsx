import React, { useState } from 'react';
import { ICDR_STAGES, DME_DEFINITIONS } from '../data/icdrDefinitions';
import { ICDRStage } from '../types/retinopathy';
import { 
  BookOpen, 
  Eye, 
  HelpCircle, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

export const RetinalAtlas: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<ICDRStage>(2);
  const [activeDictionaryTab, setActiveDictionaryTab] = useState<'lesions' | 'etdrs' | 'quiz'>('lesions');

  // Interactive Quiz questions for clinical training
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const quizQuestions = [
    {
      question: "According to the ETDRS 4-2-1 rule, which finding is sufficient alone to diagnose Severe NPDR (Stage 3)?",
      options: [
        "Severe hemorrhages in 2 quadrants",
        "Prominent IRMA (Intraretinal Microvascular Abnormalities) in ≥ 1 quadrant",
        "Microaneurysms only in 4 quadrants",
        "Hard exudates within 500µm of foveal center"
      ],
      correctIndex: 1,
      explanation: "The 4-2-1 rule defines Severe NPDR if any ONE of the following is present: (4) ≥20 intraretinal hemorrhages in all 4 quadrants, (2) Venous beading in ≥2 quadrants, or (1) Prominent IRMA in ≥1 quadrant."
    },
    {
      question: "What is the primary histological difference between Hard Exudates and Cotton Wool Spots?",
      options: [
        "Hard exudates are lipid/lipoprotein leakages, while cotton wool spots are nerve fiber layer micro-infarcts",
        "Hard exudates are ischemic infarcts, while cotton wool spots are red blood cell extravasations",
        "Cotton wool spots are caused by pericyte loss, while hard exudates are arterial micro-aneurysms",
        "Hard exudates always signify proliferative diabetic retinopathy"
      ],
      correctIndex: 0,
      explanation: "Hard exudates represent lipid and lipoprotein precipitate from broken inner blood-retina barrier (often in circinate rings). Cotton wool spots (soft exudates) are axoplasmic flow stasis caused by arteriolar occlusion and nerve fiber layer ischemia."
    },
    {
      question: "Why is a Red-Free (Green optical filter ~540nm) routinely used in fundus photography?",
      options: [
        "It amplifies corneal reflections",
        "Green light is absorbed by hemoglobin and melanin, making retinal vessels, hemorrhages, and microaneurysms appear high-contrast black against the choroid",
        "It visualizes the lens nucleus cataract severity",
        "It turns optic disc pale for glaucoma assessment"
      ],
      correctIndex: 1,
      explanation: "Red light penetrates deep into the choroid creating background glare. Green light is absorbed by hemoglobin in retinal blood vessels and hemorrhages, making microvascular lesions stand out sharply in dark contrast against the fundus."
    }
  ];

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quizQuestions[quizIndex].correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const lesionDictionary = [
    {
      name: 'Microaneurysms (MAs)',
      hallmark: 'Pinpoint red dots (15 - 50 µm)',
      pathology: 'Earliest clinical sign. Loss of vascular pericytes leading to localized saccular capillary wall outpouching.',
      clinicalPearl: 'Differentiated from dot hemorrhages on fluorescein angiography: microaneurysms hyperfluoresce early, whereas hemorrhages cause blocked hypofluorescence.',
      category: 'Stage 1+'
    },
    {
      name: 'Dot & Blot Hemorrhages',
      hallmark: 'Deep round/oval intraretinal red lesions',
      pathology: 'Rupture of precapillary arterioles or venules located in the inner nuclear and outer plexiform retinal layers.',
      clinicalPearl: 'Flame-shaped hemorrhages occur in the superficial nerve fiber layer along the horizontal raphe, while blot hemorrhages lie deep in dense retinal layers.',
      category: 'Stage 2+'
    },
    {
      name: 'Hard Exudates (Lipid Deposits)',
      hallmark: 'Bright yellow waxy discrete deposits with distinct edges',
      pathology: 'Serum lipid and lipoprotein leakage through hyperpermeable capillary walls, frequently arranged in circular rings (circinate rings) surrounding leaking microaneurysms.',
      clinicalPearl: 'Foveal involvement is the cardinal sign of Clinically Significant Macular Edema (CSME).',
      category: 'Stage 2+'
    },
    {
      name: 'Cotton Wool Spots (Soft Exudates)',
      hallmark: 'Fluffy, white, feathery superficial lesions',
      pathology: 'Micro-infarction of terminal retinal arterioles resulting in interrupted axoplasmic transport in ganglion cell axons.',
      clinicalPearl: 'Signifies acute retinal ischemia; typically resolves within 6 to 12 weeks leaving localized neuroretinal thinning.',
      category: 'Stage 2+'
    },
    {
      name: 'Venous Beading (VB)',
      hallmark: 'Sausage-like constriction and dilation of retinal veins',
      pathology: 'Severe generalized hypoxemia causing venular caliber irregularity and endothelial cell proliferation.',
      clinicalPearl: 'One of the strongest predictors of imminent progression to Proliferative DR (part of 4-2-1 rule).',
      category: 'Stage 3'
    },
    {
      name: 'IRMA (Intraretinal Microvascular Abnormalities)',
      hallmark: 'Fine, tortuous, flat intraretinal collateral shunt vessels',
      pathology: 'Remodeling of pre-existing capillary beds or early intraretinal angiogenesis adjacent to areas of capillary non-perfusion.',
      clinicalPearl: 'Differentiated from Neovascularization (NVE): IRMA does NOT cross over retinal blood vessels, does NOT leak profusely on fluorescein angiography, and remains within the retina.',
      category: 'Stage 3'
    },
    {
      name: 'Neovascularization (NVD & NVE)',
      hallmark: 'Fine, fragile sea-fan vascular fronds breaking through the internal limiting membrane',
      pathology: 'VEGF-driven pathological preretinal angiogenesis triggered by massive ischemia. Lacks mature tight junctions.',
      clinicalPearl: 'Prone to spontaneous rupture causing vitreous hemorrhage and contractile fibrous scaffolding leading to tractional retinal detachment.',
      category: 'Stage 4 (PDR)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Top */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Ophthalmic Clinical Atlas & ICDR Reference
            </h2>
            <p className="text-xs text-slate-400">
              Comprehensive staging criteria, lesion pathophysiology, and clinical training tools.
            </p>
          </div>
        </div>

        {/* Atlas Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveDictionaryTab('lesions')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeDictionaryTab === 'lesions' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ICDR Staging
          </button>
          <button
            onClick={() => setActiveDictionaryTab('etdrs')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeDictionaryTab === 'etdrs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lesion Dictionary
          </button>
          <button
            onClick={() => setActiveDictionaryTab('quiz')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeDictionaryTab === 'quiz' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clinical Quiz
          </button>
        </div>
      </div>

      {/* Mode 1: ICDR Staging Walkthrough */}
      {activeDictionaryTab === 'lesions' && (
        <div className="space-y-4">
          {/* Stage Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {([0, 1, 2, 3, 4] as ICDRStage[]).map((stageNum) => {
              const info = ICDR_STAGES[stageNum];
              const isSelected = selectedStage === stageNum;
              return (
                <button
                  key={stageNum}
                  onClick={() => setSelectedStage(stageNum)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${info.bgColor} ring-2 ring-sky-400 font-bold shadow-lg`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono block uppercase">
                    Stage {stageNum}
                  </span>
                  <span className="text-xs font-bold text-slate-100 block truncate">
                    {info.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Detail Card */}
          {(() => {
            const current = ICDR_STAGES[selectedStage];
            return (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                      ICDR Classification Standard
                    </span>
                    <h3 className="text-xl font-black text-slate-100">
                      {current.name}
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${current.bgColor}`}>
                    {current.code}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {current.description}
                </p>

                {/* Clinical Signs */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Diagnostic Hallmark Criteria
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {current.clinicalSigns.map((sign, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                      >
                        <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          ✓
                        </div>
                        <span>{sign}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up & Management */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Recommended Follow-Up Interval
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {current.recommendedFollowUp}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${current.bgColor}`}>
                    {current.urgency}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Mode 2: Lesion Dictionary */}
      {activeDictionaryTab === 'etdrs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesionDictionary.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-100">
                    {item.name}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {item.hallmark}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.pathology}
              </p>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                <span className="font-semibold text-amber-300 block mb-0.5">
                  💡 Clinical Pearl:
                </span>
                <span className="text-slate-300 leading-snug">
                  {item.clinicalPearl}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode 3: Interactive Clinical Quiz */}
      {activeDictionaryTab === 'quiz' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Clinical Staging & Lesion Knowledge Self-Test
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Question {quizIndex + 1} of {quizQuestions.length} • Score: {quizScore}
            </span>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-100 leading-snug">
              {quizQuestions[quizIndex].question}
            </h4>

            <div className="space-y-2">
              {quizQuestions[quizIndex].options.map((opt, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const isCorrect = oIdx === quizQuestions[quizIndex].correctIndex;
                let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(oIdx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer !== null && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {selectedAnswer !== null && isSelected && !isCorrect && (
                      <X className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-sky-400 block mb-1">Clinical Explanation:</strong>
                  {quizQuestions[quizIndex].explanation}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
