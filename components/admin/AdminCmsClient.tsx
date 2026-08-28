"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  ADMIN_NAV,
  panelClass,
  type AdminTabId,
} from "@/components/admin/admin-ui";
import {
  ArrayEditor,
  Field,
  HeadingFields,
  MediaPicker,
  PanelHeading,
} from "@/components/admin/AdminFormControls";
import { uploadImageToR2 } from "@/lib/cms/upload-client";
import { MEDIA_LIBRARY } from "@/lib/cms/defaults";
import type {
  Benefit,
  Capability,
  Deliverable,
  Faq,
  HeroSlide,
  ProcessStep,
  WebDevelopmentService,
} from "@/lib/types";

const TOKEN_KEY = "cms_admin_token";
const API_PATH = "/api/services/web-development";
const AUTH_PATH = "/api/cms/auth";
const TAB_KEY = "cms_admin_tab";

type Status = { kind: "idle" | "ok" | "error"; message: string };

async function verifySession(
  accessToken: string
): Promise<{ ok: boolean; accessToken?: string }> {
  const res = await fetch(AUTH_PATH, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { ok: false };
  return { ok: true, accessToken };
}

async function loginWithCredentials(
  username: string,
  password: string
): Promise<{ ok: boolean; accessToken?: string }> {
  const res = await fetch(AUTH_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as { accessToken?: string };
  return { ok: true, accessToken: data.accessToken };
}

export function AdminCmsClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [service, setService] = useState<WebDevelopmentService | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const [tab, setTab] = useState<AdminTabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);

  const dirty = useMemo(() => {
    if (!service || !savedSnapshot) return false;
    return JSON.stringify(service) !== savedSnapshot;
  }, [service, savedSnapshot]);

  const stats = useMemo(() => {
    if (!service) return null;
    return {
      capabilities: service.capabilities.length,
      process: service.process.length,
      deliverables: service.deliverables.length,
      benefits: service.benefits.length,
      faqs: service.faqs.length,
      slides: service.hero.slides.length,
    };
  }, [service]);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const res = await fetch(API_PATH, { cache: "no-store" });
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = (await res.json()) as WebDevelopmentService;
      setService(data);
      setSavedSnapshot(JSON.stringify(data));
      setJsonDraft(JSON.stringify(data, null, 2));
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedTab = sessionStorage.getItem(TAB_KEY) as AdminTabId | null;
    if (storedTab && ADMIN_NAV.some((n) => n.id === storedTab)) {
      setTab(storedTab);
    }

    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) return;

    void (async () => {
      const result = await verifySession(stored);
      if (result.ok) {
        setToken(stored);
        setAuthed(true);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
      }
    })();
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  useEffect(() => {
    sessionStorage.setItem(TAB_KEY, tab);
  }, [tab]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const user = username.trim();
    const pass = password;
    if (!user || !pass) {
      setStatus({ kind: "error", message: "أدخل اسم المستخدم وكلمة المرور." });
      return;
    }

    setLoggingIn(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const result = await loginWithCredentials(user, pass);
      if (!result.ok || !result.accessToken) {
        setStatus({
          kind: "error",
          message: "بيانات الدخول غير صحيحة.",
        });
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, result.accessToken);
      setToken(result.accessToken);
      setPassword("");
      setAuthed(true);
    } catch {
      setStatus({
        kind: "error",
        message: "تعذّر تسجيل الدخول. حاول مرة أخرى.",
      });
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setService(null);
    setToken("");
    setUsername("");
    setPassword("");
    setSavedSnapshot("");
  }

  function selectTab(id: AdminTabId) {
    setTab(id);
    setSidebarOpen(false);
  }

  function discardChanges() {
    if (!savedSnapshot) return;
    const restored = JSON.parse(savedSnapshot) as WebDevelopmentService;
    setService(restored);
    setJsonDraft(JSON.stringify(restored, null, 2));
    setStatus({
      kind: "idle",
      message: "تم التراجع عن التعديلات غير المحفوظة.",
    });
  }

  async function saveService(next: WebDevelopmentService) {
    setSaving(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const res = await fetch(API_PATH, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify(next),
      });
      const payload: unknown = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setAuthed(false);
          setService(null);
          setStatus({
            kind: "error",
            message:
              "انتهت صلاحية الجلسة أو الرمز غير صحيح. سجّل الدخول مجددًا.",
          });
          return;
        }
        const msg =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Save failed (${res.status})`;
        throw new Error(msg);
      }
      const saved = payload as WebDevelopmentService;
      setService(saved);
      setSavedSnapshot(JSON.stringify(saved));
      setJsonDraft(JSON.stringify(saved, null, 2));
      setStatus({ kind: "ok", message: "تم حفظ التعديلات بنجاح." });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "فشل الحفظ",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!service) return;
    await saveService(service);
  }

  function applyJson() {
    setJsonError("");
    try {
      const parsed: unknown = JSON.parse(jsonDraft);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed as { slug?: string }).slug !== "web-development"
      ) {
        setJsonError('يجب أن يكون الكائن صالحًا و slug = "web-development".');
        return;
      }
      setService(parsed as WebDevelopmentService);
      setStatus({
        kind: "ok",
        message: "تم تطبيق JSON محليًا — احفظ لنشره على الخادم.",
      });
      setTab("overview");
    } catch {
      setJsonError("JSON غير صالح — راجع الأقواس والفواصل.");
    }
  }

  function downloadJson() {
    if (!service) return;
    const blob = new Blob([JSON.stringify(service, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "web-development.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function trackUpload(path: string) {
    setUploads((prev) => (prev.includes(path) ? prev : [path, ...prev]));
  }

  if (!authed) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-6 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-blueprint-grid bg-grid-24 opacity-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-amber/5 blur-3xl"
        />
        <div className={`${panelClass} relative z-10 w-full max-w-md`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">
            CMS · Control Deck
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-paper">
            لوحة إدارة المحتوى
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            تحكم كامل بالنصوص والصور والأزرار وروابط الدعوة للعمل لصفحة الخدمة.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <Field
              label="اسم المستخدم"
              value={username}
              onChange={setUsername}
              required
              autoComplete="username"
              dir="ltr"
            />
            <Field
              label="كلمة المرور"
              value={password}
              onChange={setPassword}
              required
              type="password"
              autoComplete="current-password"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-none bg-amber px-4 py-3.5 font-display text-sm font-bold text-canvas transition-all hover:bg-amber/90 disabled:opacity-60"
            >
              {loggingIn ? "جاري تسجيل الدخول…" : "دخول إلى لوحة التحكم"}
            </button>
          </form>
          {status.kind === "error" && (
            <p className="mt-5 text-sm text-amber" role="alert">
              {status.message}
            </p>
          )}
        </div>
      </main>
    );
  }

  if (loading || !service || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-pulse rounded-full border-2 border-amber border-t-transparent" />
          <p className="mt-4 text-sm text-muted">جاري تحميل بيانات الخدمة…</p>
          {status.kind === "error" && (
            <p className="mt-3 text-amber" role="alert">
              {status.message}
            </p>
          )}
        </div>
      </main>
    );
  }

  const activeNav = ADMIN_NAV.find((n) => n.id === tab);

  return (
    <div className="flex min-h-screen bg-canvas">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-canvas/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-[280px] flex-col border-l border-grid bg-canvas-raised transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-grid px-5 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
            Blueprint · CMS
          </p>
          <h1 className="mt-1 font-display text-lg font-bold text-paper">
            استوديو المحتوى
          </h1>
          <p className="mt-1 truncate font-mono text-[10px] text-muted">
            /{service.slug}
          </p>
        </div>

        <nav
          className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
          aria-label="أقسام المحتوى"
        >
          {ADMIN_NAV.map((item) => {
            const active = tab === item.id;
            const count =
              item.countKey && stats ? stats[item.countKey] : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`group flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-start transition-colors ${
                  active
                    ? "bg-amber/10 text-paper ring-1 ring-amber/40"
                    : "text-muted hover:bg-canvas hover:text-paper"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 ${
                    active ? "bg-amber" : "bg-grid group-hover:bg-muted"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-[10px] opacity-70">
                    {item.hint}
                  </span>
                </span>
                {typeof count === "number" ? (
                  <span className="bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-grid p-4">
          <a
            href="/services/web-development"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center border border-grid px-3 py-2 text-xs text-paper transition-colors hover:border-amber hover:text-amber"
          >
            معاينة مباشرة ↗
          </a>
          <button
            type="button"
            onClick={logout}
            className="w-full px-3 py-2 text-xs text-muted transition-colors hover:text-amber"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-grid bg-canvas/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="border border-grid px-2.5 py-1.5 text-sm text-paper lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة الجانبية"
          >
            ☰
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber">
              {activeNav?.hint ?? "Editor"}
            </p>
            <h2 className="truncate font-display text-base font-bold text-paper sm:text-lg">
              {activeNav?.label}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {dirty ? (
              <span className="hidden items-center gap-1.5 border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[10px] text-amber sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse bg-amber" />
                غير محفوظ
              </span>
            ) : (
              <span className="hidden border border-grid px-2.5 py-1 font-mono text-[10px] text-muted sm:inline-flex">
                متزامن
              </span>
            )}
            {dirty ? (
              <button
                type="button"
                onClick={discardChanges}
                className="hidden border border-grid px-3 py-2 text-xs text-muted transition-colors hover:text-paper sm:inline-flex"
              >
                تراجع
              </button>
            ) : null}
            <button
              type="button"
              disabled={saving || !dirty}
              onClick={() => void saveService(service)}
              className="rounded-none bg-amber px-4 py-2 font-display text-xs font-bold text-canvas transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "جاري الحفظ…" : "حفظ"}
            </button>
          </div>
        </header>

        {status.message ? (
          <div
            className={`border-b px-4 py-2 text-sm sm:px-6 ${
              status.kind === "error"
                ? "border-amber/30 bg-amber/10 text-amber"
                : status.kind === "ok"
                  ? "border-grid bg-canvas-raised text-paper"
                  : "border-grid text-muted"
            }`}
            role={status.kind === "error" ? "alert" : undefined}
          >
            {status.message}
          </div>
        ) : null}

        <form
          onSubmit={handleSave}
          className="relative flex-1 overflow-y-auto bg-blueprint-grid bg-grid-24"
        >
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
            <div className={panelClass}>
              {tab === "overview" && (
                <OverviewPanel
                  service={service}
                  stats={stats}
                  dirty={dirty}
                  onGo={selectTab}
                />
              )}

              {tab === "seo" && (
                <div className="space-y-5">
                  <PanelHeading
                    title="تهيئة محركات البحث"
                    body="تظهر في نتائج البحث وبطاقات المشاركة الاجتماعية."
                  />
                  <Field
                    label="عنوان الصفحة (seoTitle)"
                    value={service.seoTitle}
                    onChange={(seoTitle) =>
                      setService({ ...service, seoTitle })
                    }
                    required
                    maxLength={70}
                  />
                  <Field
                    label="الوصف (seoDescription)"
                    value={service.seoDescription}
                    onChange={(seoDescription) =>
                      setService({ ...service, seoDescription })
                    }
                    required
                    multiline
                    maxLength={160}
                  />
                  <div className="border border-dashed border-grid bg-canvas/40 px-4 py-3">
                    <p className="font-mono text-[10px] text-muted">SLUG (ثابت)</p>
                    <p className="mt-1 font-mono text-sm text-amber">
                      {service.slug}
                    </p>
                  </div>
                </div>
              )}

              {tab === "hero" && (
                <div className="space-y-6">
                  <PanelHeading
                    title="قسم البطل"
                    body="شرائح الصور والنصوص + أزرار الدعوة للعمل وسرعة التدوير."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="نص الزر الأساسي"
                      value={service.hero.primaryCta}
                      onChange={(primaryCta) =>
                        setService({
                          ...service,
                          hero: { ...service.hero, primaryCta },
                        })
                      }
                    />
                    <Field
                      label="رابط الزر الأساسي"
                      value={service.hero.primaryCtaHref}
                      onChange={(primaryCtaHref) =>
                        setService({
                          ...service,
                          hero: { ...service.hero, primaryCtaHref },
                        })
                      }
                      mono
                      dir="ltr"
                      placeholder="#cta"
                    />
                    <Field
                      label="نص الزر الثانوي"
                      value={service.hero.secondaryCta}
                      onChange={(secondaryCta) =>
                        setService({
                          ...service,
                          hero: { ...service.hero, secondaryCta },
                        })
                      }
                    />
                    <Field
                      label="رابط الزر الثانوي"
                      value={service.hero.secondaryCtaHref}
                      onChange={(secondaryCtaHref) =>
                        setService({
                          ...service,
                          hero: { ...service.hero, secondaryCtaHref },
                        })
                      }
                      mono
                      dir="ltr"
                      placeholder="#process"
                    />
                    <Field
                      label="مدة تدوير الشرائح (مللي ثانية)"
                      value={String(service.hero.rotateIntervalMs)}
                      onChange={(v) =>
                        setService({
                          ...service,
                          hero: {
                            ...service.hero,
                            rotateIntervalMs: Math.max(
                              2500,
                              Number(v) || 5000
                            ),
                          },
                        })
                      }
                      type="number"
                      mono
                      dir="ltr"
                    />
                  </div>

                  <ArrayEditor<HeroSlide>
                    title="شرائح البطل"
                    description="كل شريحة لها صورة + eyebrow + عنوان + وصف."
                    items={service.hero.slides}
                    onChange={(slides) =>
                      setService({
                        ...service,
                        hero: { ...service.hero, slides },
                      })
                    }
                    blank={() => ({
                      image: "/images/hero-real.jpg",
                      eyebrow: "خدمة /",
                      title: "عنوان الشريحة",
                      subtitle: "وصف مختصر للشريحة.",
                    })}
                    itemLabel={(s) => s.title}
                    render={(item, i, update) => (
                      <div className="space-y-3">
                        <MediaPicker
                          label="صورة الشريحة"
                          value={item.image}
                          onChange={(image) => update(i, { ...item, image })}
                          token={token}
                          onUploaded={trackUpload}
                        />
                        <Field
                          label="Eyebrow"
                          value={item.eyebrow}
                          onChange={(eyebrow) => update(i, { ...item, eyebrow })}
                          mono
                        />
                        <Field
                          label="العنوان"
                          value={item.title}
                          onChange={(title) => update(i, { ...item, title })}
                        />
                        <Field
                          label="الوصف"
                          value={item.subtitle}
                          onChange={(subtitle) =>
                            update(i, { ...item, subtitle })
                          }
                          multiline
                          rows={3}
                        />
                      </div>
                    )}
                  />
                </div>
              )}

              {tab === "intro" && (
                <div className="space-y-5">
                  <PanelHeading
                    title="قسم المقدمة"
                    body="النص الجانبي + صورة الخلفية الثابتة + الصورة الجانبية."
                  />
                  <Field
                    label="العنوان"
                    value={service.intro.title}
                    onChange={(title) =>
                      setService({
                        ...service,
                        intro: { ...service.intro, title },
                      })
                    }
                  />
                  <Field
                    label="النص"
                    value={service.intro.body}
                    onChange={(body) =>
                      setService({
                        ...service,
                        intro: { ...service.intro, body },
                      })
                    }
                    multiline
                    rows={5}
                  />
                  <MediaPicker
                    label="صورة الخلفية"
                    value={service.intro.backgroundImage}
                    onChange={(backgroundImage) =>
                      setService({
                        ...service,
                        intro: { ...service.intro, backgroundImage },
                      })
                    }
                    token={token}
                    onUploaded={trackUpload}
                  />
                  <MediaPicker
                    label="الصورة الجانبية"
                    value={service.intro.sideImage}
                    onChange={(sideImage) =>
                      setService({
                        ...service,
                        intro: { ...service.intro, sideImage },
                      })
                    }
                    token={token}
                    onUploaded={trackUpload}
                  />
                </div>
              )}

              {tab === "capabilities" && (
                <div className="space-y-6">
                  <HeadingFields
                    value={service.capabilitiesHeading}
                    onChange={(capabilitiesHeading) =>
                      setService({ ...service, capabilitiesHeading })
                    }
                  />
                  <ArrayEditor<Capability>
                    title="بطاقات القدرات"
                    description="صورة مائلة، تفاصيل عند القلب، وزر CTA لكل بطاقة."
                    items={service.capabilities}
                    onChange={(capabilities) =>
                      setService({ ...service, capabilities })
                    }
                    blank={() => ({
                      title: "قدرة جديدة",
                      description: "وصف مختصر.",
                      image: "/images/web-real.jpg",
                      tag: "NEW",
                      details: ["نقطة 1", "نقطة 2", "نقطة 3"],
                      ctaLabel: "اطلب هذه الخدمة",
                      ctaHref: "#cta",
                    })}
                    itemLabel={(c) => c.title}
                    render={(item, i, update) => (
                      <div className="space-y-3">
                        <MediaPicker
                          label="صورة البطاقة"
                          value={item.image}
                          onChange={(image) => update(i, { ...item, image })}
                          token={token}
                          onUploaded={trackUpload}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            label="العنوان"
                            value={item.title}
                            onChange={(title) => update(i, { ...item, title })}
                          />
                          <Field
                            label="الوسم (Tag)"
                            value={item.tag}
                            onChange={(tag) => update(i, { ...item, tag })}
                            mono
                            dir="ltr"
                          />
                        </div>
                        <Field
                          label="الوصف"
                          value={item.description}
                          onChange={(description) =>
                            update(i, { ...item, description })
                          }
                          multiline
                          rows={3}
                        />
                        <Field
                          label="تفاصيل القلب (سطر لكل نقطة)"
                          value={item.details.join("\n")}
                          onChange={(raw) =>
                            update(i, {
                              ...item,
                              details: raw
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          multiline
                          rows={4}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            label="نص زر البطاقة"
                            value={item.ctaLabel}
                            onChange={(ctaLabel) =>
                              update(i, { ...item, ctaLabel })
                            }
                          />
                          <Field
                            label="رابط الزر"
                            value={item.ctaHref}
                            onChange={(ctaHref) =>
                              update(i, { ...item, ctaHref })
                            }
                            mono
                            dir="ltr"
                          />
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}

              {tab === "process" && (
                <div className="space-y-6">
                  <HeadingFields
                    value={service.processHeading}
                    onChange={(processHeading) =>
                      setService({ ...service, processHeading })
                    }
                  />
                  <ArrayEditor<ProcessStep>
                    title="خطوات العمل"
                    items={service.process}
                    onChange={(process) => setService({ ...service, process })}
                    blank={() => ({
                      revision: `REV. ${String(service.process.length + 1).padStart(2, "0")}`,
                      title: "خطوة جديدة",
                      description: "وصف الخطوة.",
                    })}
                    itemLabel={(s) => `${s.revision} — ${s.title}`}
                    render={(item, i, update) => (
                      <div className="space-y-3">
                        <Field
                          label="رقم المراجعة"
                          value={item.revision}
                          onChange={(revision) =>
                            update(i, { ...item, revision })
                          }
                          mono
                        />
                        <Field
                          label="العنوان"
                          value={item.title}
                          onChange={(title) => update(i, { ...item, title })}
                        />
                        <Field
                          label="الوصف"
                          value={item.description}
                          onChange={(description) =>
                            update(i, { ...item, description })
                          }
                          multiline
                        />
                      </div>
                    )}
                  />
                </div>
              )}

              {tab === "deliverables" && (
                <div className="space-y-6">
                  <HeadingFields
                    value={service.deliverablesHeading}
                    onChange={(deliverablesHeading) =>
                      setService({ ...service, deliverablesHeading })
                    }
                  />
                  <MediaPicker
                    label="خلفية القسم"
                    value={service.deliverablesBackground}
                    onChange={(deliverablesBackground) =>
                      setService({ ...service, deliverablesBackground })
                    }
                    token={token}
                    onUploaded={trackUpload}
                  />
                  <ArrayEditor<Deliverable>
                    title="عناصر التسليم"
                    items={service.deliverables}
                    onChange={(deliverables) =>
                      setService({ ...service, deliverables })
                    }
                    blank={() => ({ label: "عنصر تسليم جديد" })}
                    itemLabel={(d) => d.label}
                    render={(item, i, update) => (
                      <Field
                        label="النص"
                        value={item.label}
                        onChange={(label) => update(i, { label })}
                      />
                    )}
                  />
                </div>
              )}

              {tab === "portfolio" && (
                <div className="space-y-5">
                  <PanelHeading
                    title="معرض الأعمال"
                    body="حالة فارغة أو رسالة جاهزة مع صورة وزر."
                  />
                  <Field
                    label="Eyebrow"
                    value={service.portfolio.eyebrow}
                    onChange={(eyebrow) =>
                      setService({
                        ...service,
                        portfolio: { ...service.portfolio, eyebrow },
                      })
                    }
                    mono
                  />
                  <Field
                    label="العنوان"
                    value={service.portfolio.title}
                    onChange={(title) =>
                      setService({
                        ...service,
                        portfolio: { ...service.portfolio, title },
                      })
                    }
                  />
                  <Field
                    label="النص"
                    value={service.portfolio.body}
                    onChange={(body) =>
                      setService({
                        ...service,
                        portfolio: { ...service.portfolio, body },
                      })
                    }
                    multiline
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="نص الزر"
                      value={service.portfolio.buttonLabel}
                      onChange={(buttonLabel) =>
                        setService({
                          ...service,
                          portfolio: { ...service.portfolio, buttonLabel },
                        })
                      }
                    />
                    <Field
                      label="رابط الزر"
                      value={service.portfolio.buttonHref}
                      onChange={(buttonHref) =>
                        setService({
                          ...service,
                          portfolio: { ...service.portfolio, buttonHref },
                        })
                      }
                      mono
                      dir="ltr"
                    />
                  </div>
                  <MediaPicker
                    label="صورة الخلفية"
                    value={service.portfolio.image}
                    onChange={(image) =>
                      setService({
                        ...service,
                        portfolio: { ...service.portfolio, image },
                      })
                    }
                    token={token}
                    onUploaded={trackUpload}
                  />
                </div>
              )}

              {tab === "benefits" && (
                <div className="space-y-6">
                  <HeadingFields
                    value={service.benefitsHeading}
                    onChange={(benefitsHeading) =>
                      setService({ ...service, benefitsHeading })
                    }
                  />
                  <ArrayEditor<Benefit>
                    title="المزايا"
                    items={service.benefits}
                    onChange={(benefits) =>
                      setService({ ...service, benefits })
                    }
                    blank={() => ({
                      title: "ميزة جديدة",
                      description: "وصف الميزة.",
                    })}
                    itemLabel={(b) => b.title}
                    render={(item, i, update) => (
                      <div className="space-y-3">
                        <Field
                          label="العنوان"
                          value={item.title}
                          onChange={(title) => update(i, { ...item, title })}
                        />
                        <Field
                          label="الوصف"
                          value={item.description}
                          onChange={(description) =>
                            update(i, { ...item, description })
                          }
                          multiline
                        />
                      </div>
                    )}
                  />
                </div>
              )}

              {tab === "faqs" && (
                <div className="space-y-6">
                  <HeadingFields
                    value={service.faqsHeading}
                    onChange={(faqsHeading) =>
                      setService({ ...service, faqsHeading })
                    }
                  />
                  <ArrayEditor<Faq>
                    title="الأسئلة الشائعة"
                    items={service.faqs}
                    onChange={(faqs) => setService({ ...service, faqs })}
                    blank={() => ({
                      question: "سؤال جديد؟",
                      answer: "الإجابة هنا.",
                    })}
                    itemLabel={(f) => f.question}
                    render={(item, i, update) => (
                      <div className="space-y-3">
                        <Field
                          label="السؤال"
                          value={item.question}
                          onChange={(question) =>
                            update(i, { ...item, question })
                          }
                        />
                        <Field
                          label="الإجابة"
                          value={item.answer}
                          onChange={(answer) => update(i, { ...item, answer })}
                          multiline
                        />
                      </div>
                    )}
                  />
                </div>
              )}

              {tab === "cta" && (
                <div className="space-y-5">
                  <PanelHeading
                    title="دعوة للعمل النهائية"
                    body="العنوان والنص والزر وصورة الخلفية."
                  />
                  <Field
                    label="العنوان"
                    value={service.cta.title}
                    onChange={(title) =>
                      setService({
                        ...service,
                        cta: { ...service.cta, title },
                      })
                    }
                  />
                  <Field
                    label="النص"
                    value={service.cta.body}
                    onChange={(body) =>
                      setService({
                        ...service,
                        cta: { ...service.cta, body },
                      })
                    }
                    multiline
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="نص الزر"
                      value={service.cta.buttonLabel}
                      onChange={(buttonLabel) =>
                        setService({
                          ...service,
                          cta: { ...service.cta, buttonLabel },
                        })
                      }
                    />
                    <Field
                      label="رابط الزر"
                      value={service.cta.buttonHref}
                      onChange={(buttonHref) =>
                        setService({
                          ...service,
                          cta: { ...service.cta, buttonHref },
                        })
                      }
                      mono
                      dir="ltr"
                    />
                  </div>
                  <MediaPicker
                    label="صورة الخلفية"
                    value={service.cta.backgroundImage}
                    onChange={(backgroundImage) =>
                      setService({
                        ...service,
                        cta: { ...service.cta, backgroundImage },
                      })
                    }
                    token={token}
                    onUploaded={trackUpload}
                  />
                </div>
              )}

              {tab === "media" && (
                <div className="space-y-6">
                  <PanelHeading
                    title="مكتبة الوسائط"
                    body="اختر من الصور المدمجة أو ارفع صورة جديدة ثم الصق المسار في أي حقل صورة."
                  />
                  <MediaUploadPanel token={token} onUploaded={trackUpload} />
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-amber">
                      المكتبة المدمجة
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {MEDIA_LIBRARY.map((item) => (
                        <div
                          key={item.path}
                          className="overflow-hidden border border-grid bg-canvas"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={item.path}
                              alt={item.label}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-1 p-2">
                            <p className="text-xs text-paper">{item.label}</p>
                            <p className="truncate font-mono text-[9px] text-muted">
                              {item.path}
                            </p>
                            <button
                              type="button"
                              className="text-[10px] text-amber hover:underline"
                              onClick={() =>
                                void navigator.clipboard.writeText(item.path)
                              }
                            >
                              نسخ المسار
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {uploads.length > 0 ? (
                    <div>
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-amber">
                        مرفوعات هذه الجلسة
                      </p>
                      <ul className="space-y-2">
                        {uploads.map((path) => (
                          <li
                            key={path}
                            className="flex items-center gap-3 border border-grid bg-canvas px-3 py-2"
                          >
                            <div className="relative h-10 w-14 shrink-0 overflow-hidden">
                              <Image
                                src={path}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted">
                              {path}
                            </code>
                            <button
                              type="button"
                              className="text-[10px] text-amber hover:underline"
                              onClick={() =>
                                void navigator.clipboard.writeText(path)
                              }
                            >
                              نسخ
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {tab === "tools" && (
                <div className="space-y-5">
                  <PanelHeading
                    title="أدوات متقدمة"
                    body="استيراد/تصدير JSON كامل للمستند."
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={downloadJson}
                      className="border border-grid px-3 py-2 text-xs text-paper hover:border-amber"
                    >
                      تنزيل JSON
                    </button>
                    <button
                      type="button"
                      onClick={applyJson}
                      className="bg-amber px-3 py-2 text-xs font-bold text-canvas"
                    >
                      تطبيق JSON
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setJsonDraft(JSON.stringify(service, null, 2))
                      }
                      className="border border-grid px-3 py-2 text-xs text-muted hover:text-paper"
                    >
                      مزامنة من المحرر
                    </button>
                  </div>
                  {jsonError ? (
                    <p className="text-sm text-amber" role="alert">
                      {jsonError}
                    </p>
                  ) : null}
                  <RevisionsPanel token={token} />
                  <textarea
                    dir="ltr"
                    className={`${panelClass.replace("p-6 sm:p-8", "p-4")} min-h-[420px] w-full font-mono text-[11px] leading-relaxed text-paper`}
                    value={jsonDraft}
                    onChange={(e) => setJsonDraft(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function OverviewPanel({
  service,
  stats,
  dirty,
  onGo,
}: {
  service: WebDevelopmentService;
  stats: {
    capabilities: number;
    process: number;
    deliverables: number;
    benefits: number;
    faqs: number;
    slides: number;
  };
  dirty: boolean;
  onGo: (id: AdminTabId) => void;
}) {
  const cards: { id: AdminTabId; label: string; value: string | number }[] = [
    { id: "hero", label: "شرائح البطل", value: stats.slides },
    { id: "capabilities", label: "القدرات", value: stats.capabilities },
    { id: "process", label: "الخطوات", value: stats.process },
    { id: "deliverables", label: "التسليمات", value: stats.deliverables },
    { id: "benefits", label: "المزايا", value: stats.benefits },
    { id: "faqs", label: "الأسئلة", value: stats.faqs },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
          Dashboard
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper">
          {service.seoTitle}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {service.seoDescription}
        </p>
        <p className="mt-4 font-mono text-[10px] text-muted">
          الحالة:{" "}
          <span className={dirty ? "text-amber" : "text-paper"}>
            {dirty ? "تعديلات بانتظار الحفظ" : "متزامن مع الخادم"}
          </span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onGo(card.id)}
            className="border border-grid bg-canvas px-4 py-4 text-start transition-colors hover:border-amber"
          >
            <p className="font-mono text-[10px] text-muted">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-paper">
              {card.value}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["seo", "SEO"],
            ["intro", "المقدمة"],
            ["portfolio", "الأعمال"],
            ["cta", "CTA"],
            ["media", "الوسائط"],
            ["tools", "JSON"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onGo(id)}
            className="border border-grid px-3 py-1.5 text-xs text-muted transition-colors hover:border-amber hover:text-amber"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RevisionsPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<
    Array<{
      id: number;
      version: number;
      action: string;
      actor: string | null;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  async function loadRevisions() {
    setLoading(true);
    try {
      const res = await fetch("/api/services/web-development/revisions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        revisions: Array<{
          id: number;
          version: number;
          action: string;
          actor: string | null;
          createdAt: Date | string;
        }>;
      };
      setRows(
        data.revisions.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toLocaleString("ar-SD"),
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRevisions();
  }, [token]);

  return (
    <div className="border border-grid bg-canvas/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber">
          سجل التعديلات (Audit)
        </p>
        <button
          type="button"
          onClick={() => void loadRevisions()}
          className="text-[10px] text-muted hover:text-amber"
        >
          {loading ? "…" : "تحديث"}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">
          لا يوجد سجل — يتطلب PostgreSQL. بدون DB يُستخدم JSON فقط.
        </p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 border border-grid/60 px-3 py-2 font-mono text-[10px]"
            >
              <span className="text-amber">v{row.version}</span>
              <span className="text-paper">{row.action}</span>
              <span className="truncate text-muted">{row.actor ?? "—"}</span>
              <span className="shrink-0 text-muted">{row.createdAt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MediaUploadPanel({
  token,
  onUploaded,
}: {
  token: string;
  onUploaded: (path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const publicUrl = await uploadImageToR2(file, token);
      onUploaded(publicUrl);
      setMsg(`تم الرفع: ${publicUrl}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "فشل الرفع");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-dashed border-grid bg-canvas/40 p-5">
      <p className="text-sm text-paper">رفع صورة جديدة إلى Cloudflare R2</p>
      <p className="mt-1 text-xs text-muted">JPEG · PNG · WebP · GIF — حتى 5MB</p>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 bg-amber px-4 py-2 text-xs font-bold text-canvas">
        {busy ? "جاري الرفع…" : "اختر ملفًا"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </label>
      {msg ? <p className="mt-3 font-mono text-[11px] text-muted">{msg}</p> : null}
    </div>
  );
}
