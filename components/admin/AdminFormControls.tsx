"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { fieldClass, labelClass } from "@/components/admin/admin-ui";
import { uploadImageToR2 } from "@/lib/cms/upload-client";
import { MEDIA_LIBRARY } from "@/lib/cms/defaults";

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  mono?: boolean;
  type?: "text" | "password" | "number" | "url";
  placeholder?: string;
  dir?: "rtl" | "ltr" | "auto";
  autoComplete?: string;
}

export function Field({
  label,
  hint,
  value,
  onChange,
  required,
  multiline,
  rows = 4,
  maxLength,
  mono,
  type = "text",
  placeholder,
  dir = "auto",
  autoComplete,
}: FieldProps) {
  const id = useId();
  const count = value.length;
  const shared = `${fieldClass} ${mono ? "font-mono text-xs" : ""}`;

  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
          {required ? <span className="text-amber"> *</span> : null}
        </label>
        {typeof maxLength === "number" ? (
          <span
            className={`font-mono text-[10px] tabular-nums ${
              count > maxLength ? "text-amber" : "text-muted/70"
            }`}
          >
            {count}/{maxLength}
          </span>
        ) : count > 0 ? (
          <span className="font-mono text-[10px] tabular-nums text-muted/60">
            {count}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-[11px] text-muted/80">{hint}</p> : null}
      {multiline ? (
        <textarea
          id={id}
          dir={dir}
          className={`${shared} min-h-[96px] resize-y leading-relaxed`}
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          dir={dir}
          className={shared}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete ?? (type === "password" ? "current-password" : undefined)}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}

interface MediaPickerProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (path: string) => void;
  token: string;
  onUploaded?: (path: string) => void;
}

export function MediaPicker({
  label,
  hint,
  value,
  onChange,
  token,
  onUploaded,
}: MediaPickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const publicUrl = await uploadImageToR2(file, token);
      onChange(publicUrl);
      onUploaded?.(publicUrl);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الرفع");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-[10px] text-amber hover:underline"
        >
          {open ? "إغلاق المكتبة" : "مكتبة الصور"}
        </button>
      </div>
      {hint ? <p className="text-[11px] text-muted/80">{hint}</p> : null}

      <div className="flex gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-grid bg-canvas">
          {value ? (
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[9px] text-muted">
              لا صورة
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            dir="ltr"
            className={`${fieldClass} font-mono text-xs`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… أو /images/…"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-none border border-grid px-3 py-1.5 text-[11px] text-paper transition-colors hover:border-amber hover:text-amber disabled:opacity-50"
            >
              {uploading ? "جاري الرفع…" : "رفع إلى R2"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-amber" role="alert">
          {error}
        </p>
      ) : null}

      {open ? (
        <div className="grid grid-cols-2 gap-2 border border-grid bg-canvas p-3 sm:grid-cols-4">
          {MEDIA_LIBRARY.map((item) => {
            const active = value === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  onChange(item.path);
                  setOpen(false);
                }}
                className={`group relative aspect-[4/3] overflow-hidden border transition-colors ${
                  active ? "border-amber" : "border-grid hover:border-amber/60"
                }`}
              >
                <Image
                  src={item.path}
                  alt={item.label}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-canvas/80 px-1.5 py-1 font-mono text-[9px] text-paper">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

interface ArrayEditorProps<T> {
  title: string;
  description?: string;
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  render: (
    item: T,
    index: number,
    update: (index: number, next: T) => void
  ) => ReactNode;
  itemLabel?: (item: T, index: number) => string;
}

export function ArrayEditor<T>({
  title,
  description,
  items,
  onChange,
  blank,
  render,
  itemLabel,
}: ArrayEditorProps<T>) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState("");

  function update(index: number, next: T) {
    onChange(items.map((item, i) => (i === index ? next : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const a = next[index];
    const b = next[target];
    if (a === undefined || b === undefined) return;
    next[index] = b;
    next[target] = a;
    onChange(next);
  }

  function duplicate(index: number) {
    const item = items[index];
    if (item === undefined) return;
    const clone = structuredClone(item);
    onChange([...items.slice(0, index + 1), clone, ...items.slice(index + 1)]);
  }

  const filteredIndexes = items
    .map((item, i) => ({ item, i }))
    .filter(({ item, i }) => {
      if (!query.trim()) return true;
      const label = itemLabel?.(item, i) ?? JSON.stringify(item);
      return label.toLowerCase().includes(query.trim().toLowerCase());
    })
    .map(({ i }) => i);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-paper">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-none border border-grid bg-canvas px-2.5 py-1 font-mono text-[10px] text-muted">
            {items.length} عنصر
          </span>
          <button
            type="button"
            onClick={() => onChange([...items, blank()])}
            className="rounded-none bg-amber px-3 py-1.5 font-display text-xs font-bold text-canvas transition-colors hover:bg-amber/90"
          >
            + إضافة
          </button>
        </div>
      </div>

      {items.length > 3 ? (
        <input
          className={fieldClass}
          placeholder="بحث سريع داخل القائمة…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-none border border-dashed border-grid bg-canvas/50 px-6 py-10 text-center">
          <p className="text-sm text-muted">القائمة فارغة — أضف أول عنصر للبدء.</p>
          <button
            type="button"
            onClick={() => onChange([blank()])}
            className="mt-4 text-sm text-amber hover:underline"
          >
            إضافة عنصر
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredIndexes.map((i) => {
            const item = items[i];
            if (item === undefined) return null;
            const isOpen = open[i] ?? true;
            const heading = itemLabel?.(item, i) ?? `عنصر ${i + 1}`;

            return (
              <li
                key={i}
                className="overflow-hidden rounded-none border border-grid/90 bg-canvas transition-colors hover:border-grid"
              >
                <div className="flex items-center gap-2 border-b border-grid/60 px-3 py-2">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpen((prev) => ({ ...prev, [i]: !isOpen }))
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-start"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-grid font-mono text-[10px] text-amber">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm font-medium text-paper">
                      {heading || "بدون عنوان"}
                    </span>
                    <span className="ms-auto font-mono text-[10px] text-muted">
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconBtn
                      label="تحريك للأعلى"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </IconBtn>
                    <IconBtn
                      label="تحريك للأسفل"
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </IconBtn>
                    <IconBtn label="تكرار" onClick={() => duplicate(i)}>
                      ⎘
                    </IconBtn>
                    <IconBtn label="حذف" danger onClick={() => remove(i)}>
                      ×
                    </IconBtn>
                  </div>
                </div>

                {isOpen ? (
                  <div className="space-y-3 p-4">{render(item, i, update)}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {query && filteredIndexes.length === 0 ? (
        <p className="text-sm text-muted">لا نتائج مطابقة لـ «{query}».</p>
      ) : null}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center text-sm transition-colors disabled:opacity-30 ${
        danger
          ? "text-muted hover:bg-amber/10 hover:text-amber"
          : "text-muted hover:bg-canvas-raised hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

export function PanelHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6 border-b border-grid pb-5">
      <h2 className="font-display text-xl font-bold text-paper">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function HeadingFields({
  value,
  onChange,
}: {
  value: { eyebrow: string; title: string; description: string };
  onChange: (next: {
    eyebrow: string;
    title: string;
    description: string;
  }) => void;
}) {
  return (
    <div className="space-y-4 rounded-none border border-grid/70 bg-canvas/40 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber">
        عنوان القسم
      </p>
      <Field
        label="Eyebrow"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        mono
      />
      <Field
        label="العنوان"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
        required
      />
      <Field
        label="وصف مختصر"
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
        multiline
        rows={2}
      />
    </div>
  );
}
