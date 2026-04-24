import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Calendar, 
  GraduationCap, 
  Hand, 
  Briefcase,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { PatientDemographics } from '../types';

interface DemographicFormProps {
  data: PatientDemographics;
  onChange: (data: PatientDemographics) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function DemographicForm({ data, onChange, onComplete, onBack }: DemographicFormProps) {
  const updateField = (field: keyof PatientDemographics, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNested = (field: 'birthDate' | 'education' | 'employment', subField: string, value: string) => {
    onChange({
      ...data,
      [field]: { ...data[field], [subField]: value }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 p-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">استمارة البيانات الأولية</h2>
        <p className="text-slate-500">يرجى استكمال البيانات التالية قبل البدء في الاختبار</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="sleek-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
            <h3 className="font-bold text-lg">البيانات الشخصية</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">الاسم بالكامل</label>
              <input 
                type="text" 
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="أدخل الاسم"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">النوع</label>
              <div className="flex gap-4">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateField('gender', g)}
                    className={`flex-1 py-2 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      data.gender === g 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-sm font-bold">{g === 'male' ? 'ذكر' : 'أنثى'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">تاريخ الميلاد</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={2}
                  placeholder="يوم"
                  value={data.birthDate.day}
                  onChange={(e) => updateNested('birthDate', 'day', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="text" 
                  maxLength={2}
                  placeholder="شهر"
                  value={data.birthDate.month}
                  onChange={(e) => updateNested('birthDate', 'month', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="سنة"
                  value={data.birthDate.year}
                  onChange={(e) => updateNested('birthDate', 'year', e.target.value)}
                  className="w-[120px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Handedness & Education */}
        <div className="space-y-8">
          <div className="sleek-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <Hand size={20} />
              </div>
              <h3 className="font-bold text-lg">السيادة اليدوية</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'right', label: 'أستخدم اليد اليمنى في الكتابة' },
                { id: 'left', label: 'أستخدم اليد اليسرى في الكتابة' }
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => updateField('handedness', h.id)}
                  className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                    data.handedness === h.id 
                      ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' 
                      : 'bg-white border-slate-100 hover:border-orange-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${data.handedness === h.id ? 'text-orange-900' : 'text-slate-700'}`}>{h.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.handedness === h.id ? 'border-orange-500' : 'border-slate-200'}`}>
                    {data.handedness === h.id && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="sleek-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <GraduationCap size={20} />
              </div>
              <h3 className="font-bold text-lg">المستوى التعليمي</h3>
            </div>

            <div className="space-y-4">
              <select 
                value={data.education.level}
                onChange={(e) => updateNested('education', 'level', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">اختر المستوى التعليمي</option>
                <option value="basic">تعليم أساسي (ابتدائي/إعدادي)</option>
                <option value="secondary">ثانوي (عام/فني)</option>
                <option value="intermediate">فوق متوسط (معهد سنتين)</option>
                <option value="university">جامعي (بكالوريوس/ليسانس)</option>
                <option value="master">ماجستير</option>
                <option value="doctorate">دكتوراه</option>
                <option value="other">أخرى</option>
              </select>

              {(data.education.level === 'university' || data.education.level === 'master' || data.education.level === 'doctorate') && (
                <input 
                  type="text" 
                  placeholder="حدد التخصص"
                  value={data.education.specialization}
                  onChange={(e) => updateNested('education', 'specialization', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}

              {data.education.level === 'other' && (
                <input 
                  type="text" 
                  placeholder="حدد المؤهل"
                  value={data.education.otherDetail}
                  onChange={(e) => updateNested('education', 'otherDetail', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employment Status */}
      <div className="sleek-card p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Briefcase size={20} />
          </div>
          <h3 className="font-bold text-lg">الحالة العملية</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { id: 'student', label: 'طالب متفرغ' },
            { id: 'working_student', label: 'طالب (ويعمل)' },
            { id: 'full_time', label: 'موظف/عامل (تفرغ كامل)' },
            { id: 'part_time', label: 'موظف/عامل (عمل جزئي)' },
            { id: 'none', label: 'لا يعمل / أخرى' }
          ].map((type) => (
            <div key={type.id} className="space-y-2">
              <button
                onClick={() => updateNested('employment', 'type', type.id)}
                className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                  data.employment.type === type.id 
                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100' 
                    : 'bg-white border-slate-100 hover:border-purple-200'
                }`}
              >
                <span className={`text-sm font-bold ${data.employment.type === type.id ? 'text-purple-900' : 'text-slate-700'}`}>{type.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.employment.type === type.id ? 'border-purple-500' : 'border-slate-200'}`}>
                  {data.employment.type === type.id && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                </div>
              </button>
              
              {data.employment.type === type.id && type.id !== 'none' && (
                <input 
                  type="text" 
                  placeholder="طبيعة العمل والجهة"
                  value={data.employment.detail}
                  onChange={(e) => updateNested('employment', 'detail', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none animate-in fade-in slide-in-from-top-1"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center py-6 border-t border-slate-100">
        <button 
          onClick={onBack}
          className="sleek-button-secondary flex items-center gap-2"
        >
          <ArrowRight size={20} />
          <span>الرجوع للتعليمات</span>
        </button>

        <button 
          onClick={onComplete}
          disabled={!data.name || !data.gender || !data.handedness || !data.birthDate.year}
          className="sleek-button-primary px-10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>تأكيد البيانات والبدء</span>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="text-center py-4 opacity-40">
        <p className="text-[9px] font-bold uppercase tracking-tight">إعداد وبرمجة: د.أحمد حمدي عاشور الغول</p>
      </div>
    </motion.div>
  );
}
