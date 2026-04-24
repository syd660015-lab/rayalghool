/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  Timer, 
  Brain, 
  ClipboardCheck, 
  Info,
  Palette,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  LogOut,
  MousePointer2,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import DrawingCanvas, { CanvasHandle } from './components/DrawingCanvas';
import { FigureIcon } from './components/FigureIcon';
import { ClinicalReport } from './components/ClinicalReport';
import { FigureAnimation } from './components/FigureAnimation';
import { DemographicForm } from './components/DemographicForm';
import { analyzeExaminerNotes, AnalysisResult, analyzeDrawingStrategy } from './services/geminiService';
import { 
  REY_FIGURE_A_ELEMENTS, 
  REY_FIGURE_B_ELEMENTS, 
  PEN_COLORS, 
  TestPhase, 
  ScoreItem,
  FigureType,
  PatientDemographics
} from './types';

export default function App() {
  const [phase, setPhase] = useState<TestPhase>('instructions');
  const [figureType, setFigureType] = useState<FigureType>('A');
  const [currentColor, setCurrentColor] = useState(PEN_COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [copyImage, setCopyImage] = useState<string | null>(null);
  const [copySvg, setCopySvg] = useState<string | null>(null);
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [memorySvg, setMemorySvg] = useState<string | null>(null);
  const [copyScores, setCopyScores] = useState<Record<number, number>>({});
  const [memoryScores, setMemoryScores] = useState<Record<number, number>>({});
  const [copyTime, setCopyTime] = useState(0);
  const [memoryTime, setMemoryTime] = useState(0);
  const [copyStrategy, setCopyStrategy] = useState<number | null>(null);
  const [activeScoringTab, setActiveScoringTab] = useState<'copy' | 'memory'>('copy');
  const [noteValues, setNoteValues] = useState<Record<number, string>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [isDetectingStrategy, setIsDetectingStrategy] = useState(false);
  
  const [patientInfo, setPatientInfo] = useState<PatientDemographics>({
    name: '',
    gender: '',
    birthDate: { day: '', month: '', year: '' },
    education: { level: '', specialization: '', otherDetail: '' },
    handedness: '',
    employment: { type: '', detail: '' },
    age: '',
    notes: ''
  });
  
  const canvasRef = useRef<CanvasHandle>(null);

  // Load from Local Storage on mount
  useEffect(() => {
    try {
      const savedCopyScores = localStorage.getItem('rcft_copy_scores');
      const savedMemoryScores = localStorage.getItem('rcft_memory_scores');
      const savedNotes = localStorage.getItem('rcft_notes');
      const savedFigureType = localStorage.getItem('rcft_figure_type');
      const savedAnalysis = localStorage.getItem('rcft_analysis');
      const savedStrategy = localStorage.getItem('rcft_copy_strategy');
      const savedCopyTime = localStorage.getItem('rcft_copy_time');
      const savedMemoryTime = localStorage.getItem('rcft_memory_time');
      const savedPatientInfo = localStorage.getItem('rcft_patient_info');
      const savedCopySvg = localStorage.getItem('rcft_copy_svg');
      const savedMemorySvg = localStorage.getItem('rcft_memory_svg');

      if (savedCopyScores) setCopyScores(JSON.parse(savedCopyScores));
      if (savedMemoryScores) setMemoryScores(JSON.parse(savedMemoryScores));
      if (savedNotes) setNoteValues(JSON.parse(savedNotes));
      if (savedFigureType) setFigureType(savedFigureType as FigureType);
      if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
      if (savedStrategy && savedStrategy !== 'null') setCopyStrategy(Number(savedStrategy));
      if (savedCopyTime) setCopyTime(Number(savedCopyTime));
      if (savedMemoryTime) setMemoryTime(Number(savedMemoryTime));
      if (savedPatientInfo) setPatientInfo(JSON.parse(savedPatientInfo));
      if (savedCopySvg) setCopySvg(savedCopySvg);
      if (savedMemorySvg) setMemorySvg(savedMemorySvg);
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // Save to Local Storage on changes
  useEffect(() => {
    localStorage.setItem('rcft_patient_info', JSON.stringify(patientInfo));
  }, [patientInfo]);

  useEffect(() => {
    localStorage.setItem('rcft_copy_scores', JSON.stringify(copyScores));
  }, [copyScores]);

  useEffect(() => {
    localStorage.setItem('rcft_memory_scores', JSON.stringify(memoryScores));
  }, [memoryScores]);

  useEffect(() => {
    if (copyStrategy !== null) {
      localStorage.setItem('rcft_copy_strategy', String(copyStrategy));
    } else {
      localStorage.removeItem('rcft_copy_strategy');
    }
  }, [copyStrategy]);

  useEffect(() => {
    localStorage.setItem('rcft_copy_time', String(copyTime));
  }, [copyTime]);

  useEffect(() => {
    localStorage.setItem('rcft_memory_time', String(memoryTime));
  }, [memoryTime]);

  useEffect(() => {
    localStorage.setItem('rcft_notes', JSON.stringify(noteValues));
  }, [noteValues]);

  useEffect(() => {
    localStorage.setItem('rcft_figure_type', figureType);
  }, [figureType]);

  useEffect(() => {
    if (analysis) {
      localStorage.setItem('rcft_analysis', JSON.stringify(analysis));
    } else {
      localStorage.removeItem('rcft_analysis');
    }
  }, [analysis]);

  useEffect(() => {
    let interval: NodeJS.Timeout | number | undefined;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive && (phase === 'copy' || phase === 'memory')) {
        e.preventDefault();
        e.returnValue = 'هل أنت متأكد من رغبتك في مغادرة الاختبار؟ سيؤدي ذلك إلى فقدان البيانات غير المحفوظة.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, phase]);

  useEffect(() => {
    localStorage.setItem('rcft_copy_svg', copySvg || '');
  }, [copySvg]);

  useEffect(() => {
    localStorage.setItem('rcft_memory_svg', memorySvg || '');
  }, [memorySvg]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFigureTypeChange = (type: FigureType) => {
    if (Object.keys(copyScores).length > 0 || Object.keys(memoryScores).length > 0) {
      if (confirm('تغيير النموذج سيؤدي لمسح التقيمات الحالية. هل تريد الاستمرار؟')) {
        setFigureType(type);
        setCopyScores({});
        setMemoryScores({});
        setNoteValues({});
        setAnalysis(null);
        setCopyImage(null);
        setCopySvg(null);
        setMemoryImage(null);
        setMemorySvg(null);
        setCopyTime(0);
        setMemoryTime(0);
        setSeconds(0);
      }
    } else {
      setFigureType(type);
    }
  };

  const startTest = (nextPhase: TestPhase) => {
    // Calculate age if birth year is present and age is default or empty
    if (patientInfo.birthDate.year && (!patientInfo.age || patientInfo.age === '12')) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - parseInt(patientInfo.birthDate.year);
      if (!isNaN(calculatedAge)) {
        setPatientInfo(prev => ({ ...prev, age: String(calculatedAge) }));
      }
    }

    setPhase(nextPhase);
    setSeconds(0);
    setIsActive(true);
    // Clear canvas for new phase
    setTimeout(() => {
      canvasRef.current?.clear();
    }, 100);
  };

  const handleNextPhase = async () => {
    const dataUrl = canvasRef.current?.getDataUrl();
    const svgData = canvasRef.current?.getSVGData();
    const strokeData = canvasRef.current?.getStrokeData();

    if (phase === 'copy') {
      setCopyImage(dataUrl || null);
      setCopySvg(svgData || null);
      setCopyTime(seconds);
      
      // Auto-detect strategy
      if (strokeData && strokeData.length > 0) {
        setIsDetectingStrategy(true);
        try {
          const strategy = await analyzeDrawingStrategy(strokeData, figureType);
          setCopyStrategy(strategy);
        } catch (e) {
          console.error("Auto-strategy detection failed", e);
        } finally {
          setIsDetectingStrategy(false);
        }
      }

      setIsActive(false);
      setSeconds(0); // Reset for memory phase
      // We don't automatically go to memory, the user clicks "Start Memory Phase" in instructions
      setPhase('instructions');
    } else if (phase === 'memory') {
      setMemoryImage(dataUrl || null);
      setMemorySvg(svgData || null);
      setMemoryTime(seconds);
      setIsActive(false);
      setPhase('results');
    }
  };

  const runNoteAnalysis = async () => {
    setIsAnalyzing(true);
    const scoresToAnalyze = activeScoringTab === 'copy' ? copyScores : memoryScores;
    const result = await analyzeExaminerNotes(Object.values(noteValues), figureType, scoresToAnalyze);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const clearAllData = () => {
    const message = isActive && (phase === 'copy' || phase === 'memory')
      ? 'الاختبار لا يزال جارياً. هل أنت متأكد من مسح جميع البيانات؟ سيؤدي ذلك لإنهاء الاختبار الحالي.'
      : 'هل أنت متأكد من مسح جميع البيانات المخزنة؟';
    
    if (confirm(message)) {
      setCopyScores({});
      setMemoryScores({});
      setNoteValues({});
      setAnalysis(null);
      setCopyImage(null);
      setCopySvg(null);
      setMemoryImage(null);
      setMemorySvg(null);
      setCopyTime(0);
      setMemoryTime(0);
      setCopyStrategy(null);
      setSeconds(0);
      setIsActive(false);
      setPhase('instructions');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rcft_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  const downloadImage = (dataUrl: string | null, filename: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = (svgContent: string | null, filename: string) => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const Header = () => (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo">
          {figureType}
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
            برنامج تقييم شكل ري المعقد (الشكل {figureType})
            {isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Figure Complexe de Rey-Osterrieth</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={clearAllData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold"
        >
          <RotateCcw size={14} />
          مسح البيانات
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">المفحوص</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-xs text-right">
              {patientInfo.name || 'لم يتم تسجيل الاسم'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-700 text-xs text-center">
              {patientInfo.age || '??'}
            </span>
            <span className="text-[10px] text-slate-400">سنة</span>
            <User size={14} className="text-slate-400" />
            {phase === 'instructions' && !isActive && (
              <button 
                onClick={() => setPhase('demographics')}
                className="ml-2 p-1 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors"
                title="تعديل البيانات الديموغرافية"
              >
                <FileText size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <button 
          onClick={() => {
            const message = isActive && (phase === 'copy' || phase === 'memory')
              ? 'تنبيه: الاختبار لا يزال جارياً. هل أنت متأكد من رغبتك في إنهاء الجلسة؟ سيتم فقدان الوقت الحالي.'
              : 'هل أنت متأكد من رغبتك في إنهاء الجلسة؟';
            if (confirm(message)) {
              window.location.reload();
            }
          }}
          className="sleek-button-secondary flex items-center gap-2"
        >
          <LogOut size={16} />
          <span>إنهاء الجلسة</span>
        </button>
      </div>
    </header>
  );

  const renderDemographics = () => (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <motion.main className="flex-1 overflow-auto p-4 sm:p-8">
        <DemographicForm 
          data={patientInfo}
          onChange={setPatientInfo}
          onBack={() => setPhase('instructions')}
          onComplete={() => startTest('copy')}
        />
      </motion.main>
    </div>
  );

  const renderInstructions = () => (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 overflow-auto p-8"
      >
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">بوابة التقييم النفسي</span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">نظام تتبع الذاكرة البصرية الفضائية</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              تطبيق رقمي متكامل لتطبيق اختبار "شكل ري المعقد" بدقة عالية، مع ميزات التتبع الملون والتحليل الزمني الفوري.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="sleek-card p-8 group hover:border-indigo-200 transition-all h-full">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">المرحلة الأولى: النقل المباشر</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  يقوم المفحوص بنقل النموذج الأصلي مع تتبع تسلسل الرسم من خلال تغيير ألوان الأقلام (5 ألوان).
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-500">
                  • تقييم الإدراك البصري التكويني<br/>
                  • تتبع نمط الرسم (عقلاني، جزئي، شامل)
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="sleek-card p-8 group hover:border-purple-200 transition-all h-full">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="text-purple-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">المرحلة الثانية: التذكر</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  إعادة رسم الشكل من الذاكرة بعد فترة راحة قصيرة (3 دقائق) دون الاستعانة بالنموذج.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-500">
                  • تقييم الذاكرة بعيدة المدى<br/>
                  • جودة التخزين والاسترجاع المعلوماتي
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 py-10 border-t border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">استعراض تفاعلي لمكونات النماذج</h3>
              <p className="text-sm text-slate-500">شاهد عرضاً متحركاً لكيفية بناء الأشكال المعقدة</p>
            </div>
            <FigureAnimation type={figureType} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 py-8 border-t border-slate-200">
            <div className={`sleek-card p-6 border-2 transition-all ${figureType === 'A' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-100 bg-white opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Model A</span>
                <Info size={18} className="text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-slate-900">النموذج المعياري (Rey-Osterrieth)</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                هو النسخة الأكثر تعقيداً وشيوعاً، مصمم لتقييم البالغين والأطفال من سن 8 سنوات فما فوق. يتكون من هيكل مركزي مستطيل مع تفاصيل داخلية وخارجية معقدة.
              </p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500">
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• 18 عنصراً بنيوياً</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• الحد الأقصى: 36 درجة</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• السن: +8 سنوات</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• زمن التقديم: 3-5 دقائق</div>
              </div>
            </div>

            <div className={`sleek-card p-6 border-2 transition-all ${figureType === 'B' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-100 bg-white opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Model B</span>
                <Info size={18} className="text-purple-400" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-slate-900">النموذج المبسط (Figure de REY - B)</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                نسخة مخصصة للأطفال الصغار (من سن 4 إلى 8 سنوات) أو للأفراد الذين يعانون من تدهور معرفي حاد. يتألف من أشكال هندسية بسيطة (دائرة، مربع، مثلث) سهلة الإدراك.
              </p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500">
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• 11 عنصراً بسيطاً</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• الحد الأقصى: 22 درجة</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• السن: 4-8 سنوات</div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 uppercase tracking-tight">• سهولة إدراك عالية</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center gap-8 py-8 border-t border-slate-200">
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">اختر نوع النموذج للاختبار</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleFigureTypeChange('A')}
                  className={`px-8 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${figureType === 'A' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-white text-slate-400 opacity-60 hover:opacity-100'}`}
                >
                  <span className="text-2xl font-black">Model A</span>
                </button>
                <button 
                  onClick={() => handleFigureTypeChange('B')}
                  className={`px-8 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${figureType === 'B' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-white text-slate-400 opacity-60 hover:opacity-100'}`}
                >
                  <span className="text-2xl font-black">Model B</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {!copyImage ? (
                <button 
                  onClick={() => setPhase('demographics')}
                  className="sleek-button-primary flex items-center gap-3 scale-110"
                >
                  <Play size={20} fill="currentColor" />
                  بدء الاختبار (تسجيل البيانات)
                </button>
              ) : !memoryImage ? (
                <button 
                  onClick={() => startTest('memory')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-200 transition-all flex items-center gap-3"
                >
                  <Brain size={24} />
                  بدء مرحلة التذكر
                </button>
              ) : (
                <button 
                  onClick={() => setPhase('results')}
                  className="sleek-button-primary"
                >
                  عرض النتائج والتقييم النهائي
                </button>
              )}
            </div>
            
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Info size={16} />
              تضمن هذه النسخة الرقمية معايير (Figure A) العالمية
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  );

  const renderTestPhase = () => (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 block">وضع الاختبار الحالي</label>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${phase === 'copy' ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${phase === 'copy' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                <span className="font-bold text-sm">النقل المباشر</span>
                {copyImage && <CheckCircle2 size={16} className="mr-auto text-green-500" />}
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${phase === 'memory' ? 'bg-purple-50 border-purple-100 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${phase === 'memory' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                <span className="font-bold text-sm">مرحلة التذكر</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 relative overflow-hidden">
            <h3 className="text-[10px] font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <MousePointer2 size={14} className="text-indigo-500" />
              أداة الرسم الحالية
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl shadow-sm border-2 border-white ring-1 ring-slate-200"
                  style={{ backgroundColor: currentColor }}
                />
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">اللون</p>
                  <p className="text-xs font-bold text-slate-600">
                    {PEN_COLORS.indexOf(currentColor) + 1} / {PEN_COLORS.length}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">السُمك</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{lineWidth}px</span>
                  <div className="bg-slate-600 rounded-full" style={{ width: lineWidth * 2, height: lineWidth * 2 }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Info size={16} className="text-indigo-500" />
              التعليمة الحالية
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              {phase === 'copy' 
                ? '"هذا الرسم ستقوم بنقله على هذه الورقة، ليس من الضروري أن تكون دقيقاً جداً في القياس، لكن يجب أن تنتبه للتناسب ولا تنسى أي تفصيل."'
                : '"الآن قم برسم الشكل الذي نقلته منذ قليل من ذاكرتك على هذه الورقة الجديدة."'}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">تخصيص القلم</label>
            <div className="grid grid-cols-6 gap-2">
              {PEN_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-10 h-10 rounded-xl transition-all border-2 ${currentColor === color ? 'border-indigo-600 scale-110 shadow-lg ring-2 ring-indigo-100' : 'border-white hover:border-slate-200'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 group">
                <span className="group-hover:text-indigo-600 transition-colors">سُمك الخط</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-indigo-600">{lineWidth}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </aside>

        {/* Drawing Content */}
        <section className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">مساحة التتبع البصري</h2>
              <p className="text-sm text-slate-500 font-medium">راقب بدقة تسلسل رسم المفحوص للهيكل العام</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-3 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">الوقت المستغرق</p>
                  <p className="text-2xl font-mono font-bold text-indigo-600">{formatTime(seconds)}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  <Timer size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-6 overflow-hidden relative">
            <div className={`flex-1 sleek-card relative overflow-hidden flex items-center justify-center p-4 transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50 bg-slate-50 p-10' : ''}`}>
              <DrawingCanvas ref={canvasRef} currentColor={currentColor} lineWidth={lineWidth} width={isExpanded ? 1200 : 800} height={isExpanded ? 900 : 600} elapsedTime={seconds} />
              
              <div className="absolute top-6 right-6 flex gap-2">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tight shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  اللوحة النشطة ({figureType})
                </span>
                {phase === 'memory' && (
                  <span className="px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold text-purple-600 uppercase tracking-tight shadow-sm flex items-center gap-1 text-right">
                    وضع التذكر - بدون نموذج
                  </span>
                )}
              </div>

              {/* Expanded Controls Overlay */}
              {isExpanded && (
                <div className="absolute top-6 left-6 flex flex-col gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">الوقت</p>
                      <p className="font-mono font-bold text-indigo-600">{formatTime(seconds)}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2 font-bold text-sm"
                    >
                      <Minimize2 size={20} />
                      تصغير
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {PEN_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          className={`w-10 h-10 rounded-xl transition-all border-2 ${currentColor === color ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white hover:border-slate-200'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => canvasRef.current?.undo()} className="flex-1 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                        <RotateCcw size={14} /> تراجع
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle Button for non-expanded state */}
              {!isExpanded && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:bg-white transition-all text-indigo-600 group"
                  title="ملء الشاشة"
                >
                  <Maximize2 size={24} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>

            {phase === 'copy' && (
              <div className="w-80 flex flex-col gap-4 shrink-0">
                <div className="flex-1 sleek-card flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">النموذج المرجعي</span>
                    <FileText size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center bg-white min-h-[350px]">
                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden rounded-lg border border-slate-100 shadow-inner bg-slate-50/50">
                      <img 
                        src={figureType === 'A' ? "https://i.ibb.co/nscS0sxy/figure-a.png" : "https://i.ibb.co/0jNpxVMR/figure-b.png"} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to second guess for direct links
                          if (target.src.includes("figure-a.png")) {
                             target.src = "https://i.ibb.co/nscS0sxy/image.png";
                             return;
                          }
                          // Final fallbacks
                          if (figureType === 'A') {
                            target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Figure_Complexe_de_Rey-Osterrieth.svg/1200px-Figure_Complexe_de_Rey-Osterrieth.svg.png";
                          } else {
                            target.src = "https://www.psychol-ok.com/images/tests/rey_complex_figure_b.jpg";
                          }
                        }}
                        alt={`Rey Figure ${figureType}`} 
                        className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 hover:scale-105"
                        id="reference-figure-img"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[8px] font-bold text-slate-400 uppercase tracking-tighter border border-slate-100 shadow-sm">
                        نموذج مرجعي معتمد
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-48 sleek-card p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0">
                  <h4 className="text-xs font-bold opacity-80 uppercase tracking-widest mb-3">توجيه الفاحص</h4>
                  <p className="text-xs leading-relaxed opacity-95">
                    راقب العناصر الكبيرة أولاً. هل بدأ بالمستطيل المركزي؟ (طريقة عقلانية) أم بدأ بالتفاصيل الصغيرة؟
                    <br/><br/>
                    استخدم الألوان لتمييز الترتيب الزمني للأجزاء المرسومة.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex gap-4">
              <button 
                onClick={() => canvasRef.current?.undo()}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200">
                  <RotateCcw size={14} />
                </div>
                تراجع
              </button>
            </div>
            
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${phase === 'copy' ? 'bg-indigo-600 scale-125' : 'bg-slate-200'}`}></div>
                <div className={`w-2 h-2 rounded-full ${phase === 'memory' ? 'bg-purple-600 scale-125' : 'bg-slate-200'}`}></div>
            </div>

            <button 
              onClick={handleNextPhase}
              disabled={isDetectingStrategy}
              className={`sleek-button-primary flex items-center gap-2 pr-10 pl-6 group ${isDetectingStrategy ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isDetectingStrategy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري تحليل النمط...</span>
                </>
              ) : (
                <>
                  <span>{phase === 'copy' ? 'إنهاء وحفظ النقل' : 'إنهاء مرحلة التذكر'}</span>
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </section>
      </main>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-auto p-8"
      >
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">تحليل وتقييم النتائج</h2>
              <p className="text-slate-500 font-medium mt-1">تقييم العناصر الـ 18 وفق نظام التنقيط المعياري (0-2)</p>
            </div>
            <button 
              onClick={() => setPhase('instructions')}
              className="sleek-button-secondary border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              العودة للرئيسية
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">رسم مرحلة النقل المباشر</span>
                <span className="text-xs font-mono text-slate-400">التتبع الملون مفعل</span>
              </div>
              <div className="sleek-card p-2 bg-slate-100 shadow-inner relative group">
                {copyImage ? (
                  <img src={copyImage} alt="Copy phase" className="w-full h-64 object-contain rounded-2xl bg-white" />
                ) : (
                  <div className="w-full h-64 rounded-2xl bg-white flex flex-col items-center justify-center text-slate-300">
                    <Info size={48} className="mb-2 opacity-20" />
                    <span className="text-xs font-bold">لم يتم رسم مرحلة النقل</span>
                  </div>
                )}
                {copyImage && (
                  <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => downloadImage(copyImage, `rey_figure_${figureType}_copy.png`)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-lg text-indigo-600 flex items-center gap-2 text-xs font-bold hover:bg-white"
                      title="تحميل PNG"
                    >
                      <Download size={14} />
                      PNG
                    </button>
                    <button 
                      onClick={() => downloadSVG(copySvg, `rey_figure_${figureType}_copy.svg`)}
                      className="bg-indigo-600 p-2 rounded-xl shadow-lg text-white flex items-center gap-2 text-xs font-bold hover:bg-indigo-700"
                      title="تحميل SVG (شعاعي)"
                    >
                      <Download size={14} />
                      SVG
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">رسم مرحلة التذكر</span>
              </div>
              <div className="sleek-card p-2 bg-slate-100 shadow-inner relative group">
                {memoryImage ? (
                  <img src={memoryImage} alt="Memory phase" className="w-full h-64 object-contain rounded-2xl bg-white" />
                ) : (
                  <div className="w-full h-64 rounded-2xl bg-white flex flex-col items-center justify-center text-slate-300">
                    <Info size={48} className="mb-2 opacity-20" />
                    <span className="text-xs font-bold">لم يتم رسم مرحلة التذكر</span>
                  </div>
                )}
                {memoryImage && (
                  <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => downloadImage(memoryImage, `rey_figure_${figureType}_memory.png`)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-lg text-purple-600 flex items-center gap-2 text-xs font-bold hover:bg-white"
                      title="تحميل PNG"
                    >
                      <Download size={14} />
                      PNG
                    </button>
                    <button 
                      onClick={() => downloadSVG(memorySvg, `rey_figure_${figureType}_memory.svg`)}
                      className="bg-purple-600 p-2 rounded-xl shadow-lg text-white flex items-center gap-2 text-xs font-bold hover:bg-purple-700"
                      title="تحميل SVG (شعاعي)"
                    >
                      <Download size={14} />
                      SVG
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 sleek-card p-6 bg-white space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Palette className="text-indigo-600" size={20} />
                نمط ونوع استراتيجية النقل (Type de Copie)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 1, label: "البناء بالبدء بالهيكل المركزي", desc: "نضج عقلي كامل" },
                  { id: 2, label: "تجميع أجزاء الهيكل", desc: "تخطيط جيد" },
                  { id: 3, label: "البدء من المحيط", desc: "تتبع خارجي" },
                  { id: 4, label: "تجميع تفاصيل متجاورة", desc: "ضعف في الإدراك الكلي" },
                  { id: 5, label: "خربشة عشوائية", desc: "عدم كفاية ذهنية" },
                  { id: 6, label: "اختزال الشكل لمخطط بسيط", desc: "تبسيط مفرط" },
                  { id: 7, label: "تشويه كلي للشكل", desc: "عجز بصر حركي" }
                ].map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setCopyStrategy(type.id)}
                    className={`p-3 rounded-2xl border-2 transition-all text-right group ${copyStrategy === type.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-50 hover:border-indigo-100 hover:bg-slate-50'}`}
                  >
                    <p className={`text-xs font-bold mb-1 transition-colors ${copyStrategy === type.id ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'}`}>{type.label}</p>
                    <p className={`text-[10px] leading-tight transition-colors ${copyStrategy === type.id ? 'text-indigo-500' : 'text-slate-400'}`}>{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="sleek-card p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-4">التوقيتات المسجلة</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-xs opacity-60">زمن النقل</span>
                    <span className="font-mono font-bold text-indigo-400">{formatTime(copyTime)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-xs opacity-60">زمن التذكر</span>
                    <span className="font-mono font-bold text-purple-400">{formatTime(memoryTime)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] opacity-40 leading-relaxed mt-4">
                تؤخذ الأزمان بعين الاعتبار عند حساب الرتب المئينية حسب الفئة العمرية.
              </p>
            </div>
          </div>

          <div className="sleek-card overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col gap-6 bg-slate-50/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600">
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">دليل التنقيط المعياري</h3>
                    <p className="text-xs text-slate-400 font-medium">نقطتان: وضع صحيح، نقطة: تشوه بسيط، نصف: وضع خاطئ، صفر: غياب</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">الدرجة الكلية ({figureType} - {activeScoringTab === 'copy' ? 'نقل' : 'تذكر'})</p>
                  <div className={`flex items-baseline gap-1 ${activeScoringTab === 'copy' ? 'text-indigo-600' : 'text-purple-600'}`}>
                    <span className="text-4xl font-extrabold">
                      {(Object.values(activeScoringTab === 'copy' ? copyScores : memoryScores) as number[]).reduce((a, b) => a + b, 0).toFixed(1)}
                    </span>
                    <span className="text-sm font-bold opacity-60">/ {figureType === 'A' ? '36.0' : '22.0'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveScoringTab('copy')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${activeScoringTab === 'copy' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                >
                  تقييم مرحلة النقل
                </button>
                <button 
                  onClick={() => setActiveScoringTab('memory')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${activeScoringTab === 'memory' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                >
                  تقييم مرحلة التذكر
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-100/50 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4 w-16 text-center">ID</th>
                    <th className="px-4 py-4 w-20 text-center">الشكل</th>
                    <th className="px-6 py-4">العنصر البنيوي</th>
                    <th className="px-6 py-4 text-center">تقييم الجودة والمكان ({activeScoringTab === 'copy' ? 'نقل' : 'تذكر'})</th>
                    <th className="px-6 py-4">ملاحظات الفاحص</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(figureType === 'A' ? REY_FIGURE_A_ELEMENTS : REY_FIGURE_B_ELEMENTS).map(el => (
                    <tr key={el.id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-6 py-4 text-center font-mono text-slate-300 font-bold">{el.id}</td>
                      <td className="px-4 py-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mx-auto">
                          <FigureIcon id={el.id} type={figureType} className="w-12 h-12" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">{el.label}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          {[0, 0.5, 1, 2].map(score => (
                            <button
                              key={score}
                              onClick={() => {
                                const setter = activeScoringTab === 'copy' ? setCopyScores : setMemoryScores;
                                setter(prev => ({ ...prev, [el.id]: score }));
                              }}
                              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border-2 ${
                                (activeScoringTab === 'copy' ? copyScores[el.id] : memoryScores[el.id]) === score 
                                ? (activeScoringTab === 'copy' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-purple-600 text-white border-purple-600 shadow-md') + ' transform scale-110' 
                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                              }`}
                            >
                              {score === 0.5 ? '½' : score}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-slate-100/50 rounded-lg border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all px-3 py-2">
                          <input 
                            type="text" 
                            placeholder="تدوين ملاحظة..." 
                            value={noteValues[el.id] || ''}
                            onChange={(e) => setNoteValues(prev => ({ ...prev, [el.id]: e.target.value }))}
                            className="w-full bg-transparent outline-none text-xs text-slate-600 font-bold"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Analysis Section */}
            <div className="p-8 bg-indigo-50 border-t border-indigo-100 border-b">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">تحليل الملاحظات بالذكاء الاصطناعي</h4>
                    <p className="text-xs text-slate-500">استخراج التوجهات السريرية والأنماط المتكررة آلياً</p>
                  </div>
                </div>
                <button 
                  onClick={runNoteAnalysis}
                  disabled={isAnalyzing || (Object.values(noteValues) as string[]).filter(n => n.trim()).length === 0}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      تحديث التحليل الذكي
                    </>
                  )}
                </button>
              </div>

              {analysis ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                      <h5 className="text-sm font-black text-indigo-600 mb-2 uppercase tracking-tight">الخلاصة السريرية</h5>
                      <p className="text-slate-700 leading-relaxed text-sm font-medium">{analysis.summary}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                      <h5 className="text-sm font-black text-indigo-600 mb-2 uppercase tracking-tight">الأنماط والمواضيع المتكررة</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysis.themes.map((t, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
                            {t.theme} ({t.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                    <h5 className="text-sm font-black text-indigo-600 mb-2 uppercase tracking-tight">رؤى وتوصيات إضافية</h5>
                    <ul className="space-y-3">
                      {analysis.clinicalInsights.map((insight, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                          <span className="font-medium">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <Info size={48} className="mb-4 text-slate-400" />
                  <p className="font-bold text-slate-500">قم بتدوين ملاحظات الفاحص ثم اضغط على "تحديث التحليل الذكي"</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-10">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">إجمالي النقل</p>
                  <p className="text-3xl font-extrabold text-indigo-400">
                    {(Object.values(copyScores) as number[]).reduce((a, b) => a + b, 0).toFixed(1)}
                    <span className="text-xs opacity-40 mr-1">درجة</span>
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-800"></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">إجمالي التذكر</p>
                  <p className="text-3xl font-extrabold text-purple-400">
                    {(Object.values(memoryScores) as number[]).reduce((a, b) => a + b, 0).toFixed(1)}
                    <span className="text-xs opacity-40 mr-1">درجة</span>
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-800"></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">حمولة الدرجة (Copy/Memory)</p>
                  <p className="text-xl font-bold text-indigo-400">
                    {(((Object.values(memoryScores) as number[]).reduce((a, b) => a + b, 0) / (Object.values(copyScores) as number[]).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">الحالة التقديرية</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      (Object.values(copyScores) as number[]).reduce((a, b) => a + b, 0) > (figureType === 'A' ? 30 : 18) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {(Object.values(copyScores) as number[]).reduce((a, b) => a + b, 0) > (figureType === 'A' ? 30 : 18) ? 'أداء طبيعي' : 'يتطلب متابعة'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReport(true)}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl"
                >
                  <FileText size={20} />
                  عرض التقرير السريري الموحد
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-600">
      <AnimatePresence mode="wait">
        {phase === 'instructions' && renderInstructions()}
        {phase === 'demographics' && renderDemographics()}
        {(phase === 'copy' || phase === 'memory') && renderTestPhase()}
        {phase === 'results' && renderResults()}
      </AnimatePresence>

      <AnimatePresence>
        {showReport && (
          <ClinicalReport 
            patientInfo={patientInfo}
            figureType={figureType}
            copyImage={copyImage}
            memoryImage={memoryImage}
            copyScores={copyScores}
            memoryScores={memoryScores}
            copyTime={copyTime}
            memoryTime={memoryTime}
            copyStrategy={copyStrategy}
            analysis={analysis}
            onClose={() => setShowReport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
