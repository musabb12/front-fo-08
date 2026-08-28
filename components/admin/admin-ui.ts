export const fieldClass =
  "mt-1.5 w-full rounded-none border border-grid/80 bg-canvas px-3.5 py-2.5 text-sm text-paper placeholder:text-muted/70 transition-colors hover:border-grid focus:border-amber focus:outline-none";

export const labelClass =
  "block text-[11px] font-medium tracking-wide text-muted";

export const panelClass =
  "relative overflow-hidden rounded-none border border-grid bg-canvas-raised/90 p-6 sm:p-8";

export type AdminTabId =
  | "overview"
  | "seo"
  | "hero"
  | "intro"
  | "capabilities"
  | "process"
  | "deliverables"
  | "portfolio"
  | "benefits"
  | "faqs"
  | "cta"
  | "media"
  | "tools";

export interface AdminNavItem {
  id: AdminTabId;
  label: string;
  hint: string;
  countKey?:
    | "capabilities"
    | "process"
    | "deliverables"
    | "benefits"
    | "faqs"
    | "slides";
}

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "overview", label: "نظرة عامة", hint: "ملخص وسرعة وصول" },
  { id: "seo", label: "SEO", hint: "العنوان والوصف" },
  { id: "hero", label: "البطل", hint: "شرائح · أزرار", countKey: "slides" },
  { id: "intro", label: "المقدمة", hint: "نص · صور خلفية" },
  {
    id: "capabilities",
    label: "القدرات",
    hint: "بطاقات قابلة للقلب",
    countKey: "capabilities",
  },
  {
    id: "process",
    label: "خطوات العمل",
    hint: "مراجعات REV",
    countKey: "process",
  },
  {
    id: "deliverables",
    label: "التسليمات",
    hint: "قائمة + خلفية",
    countKey: "deliverables",
  },
  { id: "portfolio", label: "الأعمال", hint: "معرض / حالة فارغة" },
  {
    id: "benefits",
    label: "المزايا",
    hint: "لماذا معنا",
    countKey: "benefits",
  },
  { id: "faqs", label: "الأسئلة", hint: "FAQ", countKey: "faqs" },
  { id: "cta", label: "دعوة للعمل", hint: "CTA النهائي" },
  { id: "media", label: "الوسائط", hint: "مكتبة الصور" },
  { id: "tools", label: "أدوات", hint: "JSON · استيراد · تصدير" },
];
