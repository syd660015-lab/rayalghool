import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  User, 
  Clock, 
  Brain, 
  ClipboardCheck, 
  ExternalLink,
  Printer,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult } from '../services/geminiService';
import { 
  FigureType, 
  REY_FIGURE_A_ELEMENTS, 
  REY_FIGURE_B_ELEMENTS,
  PatientDemographics
} from '../types';

interface ClinicalReportProps {
  patientInfo: PatientDemographics;
  figureType: FigureType;
  copyImage: string | null;
  memoryImage: string | null;
  copyScores: Record<number, number>;
  memoryScores: Record<number, number>;
  copyTime: number;
  memoryTime: number;
  copyStrategy: number | null;
  analysis: AnalysisResult | null;
  onClose: () => void;
}

const STRATEGY_LABELS: Record<number, string> = {
  1: "البدء بالمحيط الخارجي",
  2: "البدء بالهيكل الداخلي",
  3: "تجزئة الشكل إلى أجزاء",
  4: "رسم تفصيلي تدريجي",
  5: "رسم عشوائي غير منظم"
};

const EDUCATION_LABELS: Record<string, string> = {
  basic: "تعليم أساسي (ابتدائي/إعدادي)",
  secondary: "ثانوي (عام/فني)",
  intermediate: "فوق متوسط (معهد سنتين)",
  university: "جامعي (بكالوريوس/ليسانس)",
  master: "ماجستير",
  doctorate: "دكتوراه",
  other: "أخرى"
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  student: "طالب متفرغ",
  working_student: "طالب (ويعمل)",
  full_time: "موظف/عامل (تفرغ كامل)",
  part_time: "موظف/عامل (عمل جزئي)",
  none: "لا يعمل / أخرى"
};

export const ClinicalReport: React.FC<ClinicalReportProps> = ({
  patientInfo,
  figureType,
  copyImage,
  memoryImage,
  copyScores,
  memoryScores,
  copyTime,
  memoryTime,
  copyStrategy,
  analysis,
  onClose
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const calculateTotalScore = (scores: Record<number, number>) => {
    return Object.values(scores).reduce((a, b) => a + b, 0);
  };

  const copyTotal = calculateTotalScore(copyScores);
  const memoryTotal = calculateTotalScore(memoryScores);
  const maxScore = figureType === 'A' ? 36 : 22;
  const elements = figureType === 'A' ? REY_FIGURE_A_ELEMENTS : REY_FIGURE_B_ELEMENTS;

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDate = new Date().toLocaleDateString('ar-SA');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header - Non-Printable UI */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <FileText className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">التقرير الإكلينيكي الشامل</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Printer size={18} />
              طباعة التقرير
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div 
          ref={reportRef}
          className="p-12 overflow-y-auto flex-1 print:p-0 print:overflow-visible"
          dir="rtl"
        >
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Clinical Header */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">تقرير اختبار ري للأشكال المعقدة (RCFT)</h1>
                <p className="text-slate-500 font-medium">النموذج المستخدم: الشكل ({figureType})</p>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 justify-end text-slate-600 mb-1">
                  <Calendar size={16} />
                  <span className="font-bold">{currentDate}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono">ID: RCFT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            {/* Patient Info Grid */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                معلومات المفحوص الشاملة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">الاسم بالكامل</label>
                  <p className="text-lg font-bold text-slate-800">{patientInfo.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">النوع</label>
                  <p className="text-lg font-bold text-slate-800">{patientInfo.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">العمر المعتمد</label>
                  <p className="text-lg font-bold text-slate-800">{patientInfo.age} سنة</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">تاريخ الميلاد</label>
                  <p className="text-lg font-bold text-slate-800">
                    {patientInfo.birthDate.day} / {patientInfo.birthDate.month} / {patientInfo.birthDate.year}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">السيادة اليدوية</label>
                  <p className="text-lg font-bold text-slate-800">{patientInfo.handedness === 'right' ? 'اليد اليمنى' : 'اليد اليسرى'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">المستوى التعليمي</label>
                  <p className="text-lg font-bold text-slate-800">
                    {EDUCATION_LABELS[patientInfo.education.level] || 'غير محدد'}
                    {patientInfo.education.specialization && ` - تخصص: ${patientInfo.education.specialization}`}
                    {patientInfo.education.otherDetail && ` - ${patientInfo.education.otherDetail}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">الحالة العملية</label>
                  <p className="text-lg font-bold text-slate-800">
                    {EMPLOYMENT_LABELS[patientInfo.employment.type] || 'غير محدد'}
                    {patientInfo.employment.detail && ` (${patientInfo.employment.detail})`}
                  </p>
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ملاحظات إضافية</label>
                  <p className="text-slate-700 leading-relaxed font-medium mt-1">{patientInfo.notes || 'لا يوجد'}</p>
                </div>
              </div>

              {/* Administration Section */}
              <div className="mt-6 bg-slate-100 p-6 rounded-2xl border-2 border-slate-300 border-dashed">
                <div className="flex items-center gap-2 mb-4 text-slate-500">
                  <CheckCircle2 size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">خاص بالإدارة (Administration Only)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تاريخ إجراء الاختبار</label>
                    <p className="text-md font-bold text-slate-700">{currentDate}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تاريخ الميلاد المعتمد</label>
                    <p className="text-md font-bold text-slate-700">
                      {patientInfo.birthDate.day && patientInfo.birthDate.month && patientInfo.birthDate.year 
                        ? `${patientInfo.birthDate.day} / ${patientInfo.birthDate.month} / ${patientInfo.birthDate.year}` 
                        : 'غير مسجل'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">السن (بالسنوات)</label>
                    <p className="text-md font-bold text-slate-700">{patientInfo.age} سنة</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quantitative Results Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ClipboardCheck size={20} className="text-emerald-600" />
                النتائج الكمية (الدرجات والوقت)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center pt-2">
                {/* Copy Score */}
                <div className="relative group p-6 rounded-3xl border-2 border-indigo-100 bg-white">
                  <span className="absolute -top-3 right-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">مرحلة النقل</span>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-indigo-600 mb-1">{copyTotal}</span>
                    <span className="text-slate-400 text-xs font-bold">من أصل {maxScore} نقطة</span>
                    <div className="mt-4 flex items-center gap-2 text-slate-500 font-bold bg-indigo-50 px-3 py-1 rounded-full">
                      <Clock size={14} />
                      {formatTime(copyTime)}
                    </div>
                  </div>
                </div>

                {/* Memory Score */}
                <div className="relative group p-6 rounded-3xl border-2 border-purple-100 bg-white">
                  <span className="absolute -top-3 right-6 px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">مرحلة التذكر</span>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-purple-600 mb-1">{memoryTotal}</span>
                    <span className="text-slate-400 text-xs font-bold">من أصل {maxScore} نقطة</span>
                    <div className="mt-4 flex items-center gap-2 text-slate-500 font-bold bg-purple-50 px-3 py-1 rounded-full">
                      <Clock size={14} />
                      {formatTime(memoryTime)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Qualitative Strategy */}
            {copyStrategy && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-amber-600" />
                  إستراتيجية النقل
                </h3>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 font-bold text-amber-800">
                  {STRATEGY_LABELS[copyStrategy]}
                </div>
              </section>
            )}

            {/* AI Analysis & Insights */}
            {analysis && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Brain size={20} className="text-indigo-600" />
                  التحليل الإكلينيكي الذكي
                </h3>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {analysis.summary}
                    </p>
                  </div>
                  
                  {analysis.clinicalInsights.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.clinicalInsights.map((insight, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                          <p className="text-sm font-bold text-slate-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Visual Drawings View */}
            <section className="break-before-page">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">التوثيق المرئي للرسومات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-center font-bold text-indigo-600 mb-4 bg-indigo-50 py-2 rounded-xl">رسم النقل</h4>
                  {copyImage ? (
                    <div className="border shadow-sm rounded-2xl overflow-hidden bg-slate-50">
                      <img src={copyImage} alt="Copy Drawing" className="w-full h-auto" />
                    </div>
                  ) : (
                    <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-bold italic">
                      لم يتم تسجيل رسم
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-center font-bold text-purple-600 mb-4 bg-purple-50 py-2 rounded-xl">رسم التذكر</h4>
                  {memoryImage ? (
                    <div className="border shadow-sm rounded-2xl overflow-hidden bg-slate-50">
                      <img src={memoryImage} alt="Memory Drawing" className="w-full h-auto" />
                    </div>
                  ) : (
                    <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-bold italic">
                      لم يتم تسجيل رسم
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Footer / Signature */}
            <div className="pt-24 flex justify-between items-end border-t border-slate-200">
              <div className="space-y-4">
                <div className="h-0.5 w-48 bg-slate-300"></div>
                <p className="text-sm font-bold text-slate-500 text-center">توقيع الفاحص</p>
              </div>
              <div className="text-left text-[10px] text-slate-400 font-mono">
                RCFT ANALYTICS v1.0.0<br />
                Generated on: {new Date().toISOString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
          }
          body * {
            visibility: hidden;
          }
          .print-hidden {
            display: none !important;
          }
          div[ref="reportRef"], div[ref="reportRef"] * {
            visibility: visible;
          }
          div[ref="reportRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            overflow: visible !important;
          }
          .break-before-page {
            page-break-before: always;
          }
          .shadow-2xl, .shadow-lg, .shadow-sm {
            box-shadow: none !important;
          }
          .rounded-3xl, .rounded-2xl, .rounded-xl {
            border-radius: 8px !important;
          }
          .border-indigo-100, .border-purple-100 {
            border-color: #e2e8f0 !important;
          }
          .bg-slate-50, .bg-indigo-50, .bg-purple-50, .bg-amber-50 {
            background-color: #f8fafc !important;
            print-color-adjust: exact;
          }
          .text-indigo-600 { color: #4f46e5 !important; }
          .text-purple-600 { color: #9333ea !important; }
        }
      `}</style>
    </div>
  );
};
