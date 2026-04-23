import React from 'react';

export interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  isNewPath?: boolean;
}

export type TestPhase = 'instructions' | 'copy' | 'memory' | 'results';

export interface ScoreItem {
  id: number;
  label: string;
  points: number; // 0, 0.5, 1, 2
  notes: string;
}

export type FigureType = 'A' | 'B';

export interface FigureElement {
  id: number;
  label: string;
  icon?: React.ReactNode;
}

export const REY_FIGURE_A_ELEMENTS: FigureElement[] = [
  { id: 1, label: "الصليب الخارجي على يسار المستطيل الرئيسي" },
  { id: 2, label: "المستطيل الرئيسي الكبير" },
  { id: 3, label: "الخطين المتقاطعين وسط المستطيل الرئيسي" },
  { id: 4, label: "الخط الأفقي الذي يتوسط المستطيل الرئيسي" },
  { id: 5, label: "الخط العمودي الذي يتوسط المستطيل الرئيسي" },
  { id: 6, label: "المستطيل الصغير الداخلي" },
  { id: 7, label: "الخط الأفقي الصغير" },
  { id: 8, label: "الخطوط المتوازية الأفقية في أعلى المستطيل الرئيسي" },
  { id: 9, label: "المثلث في الأعلى خارج المستطيل الرئيسي" },
  { id: 10, label: "الخط العمودي الصغير في داخل وبمقدمة المستطيل الرئيسي" },
  { id: 11, label: "الدائرة التي تتخللها (3) نقاط في المنطقة العليا الأمامية" },
  { id: 12, label: "الخطوط الخمس المائلة المتوازية الصغيرة في مقدمة المستطيل الرئيسي" },
  { id: 13, label: "الخطين المائلين في مقدمة الشكل (على اليمين)" },
  { id: 14, label: "المعين الصغير الموجود في مقدمة المثلث رقم (13)" },
  { id: 15, label: "الخط العمودي المتواجد في المثلث رقم (13)" },
  { id: 16, label: "امتداد الخط الأفقي رقم (4) في المثلث رقم (13)" },
  { id: 17, label: "الصليب في أسفل الشكل مع الخط الأفقي الممتد منه والخط العمودي" },
  { id: 18, label: "المربع الموجود في الجانب الأسفل الأيسر للمثلث رقم (2)" },
];

export const REY_FIGURE_B_ELEMENTS: FigureElement[] = [
  { id: 1, label: "الدائرة الكبيرة" },
  { id: 2, label: "المثلث داخل الدائرة" },
  { id: 3, label: "المستطيل الأفقي" },
  { id: 4, label: "نصف الدائرة مع الخطوط العمودية بداخله" },
  { id: 5, label: "المربع في الأسفل على اليمين" },
  { id: 6, label: "الدائرة الصغيرة داخل المربع" },
  { id: 7, label: "النقطتين داخل الدائرة الكبيرة" },
  { id: 8, label: "الصليب الصغير داخل المثلث" },
  { id: 9, label: "علامة يساوي (=) بجانب المربع" },
  { id: 10, label: "الخط الأفقي الواصل بين الأشكال" },
  { id: 11, label: "الخط المائل داخل المربع" },
];

export const PEN_COLORS = [
  '#000000', // Black
  '#E11D48', // Red
  '#2563EB', // Blue
  '#059669', // Green
  '#D97706', // Orange
  '#7C3AED', // Purple
];
