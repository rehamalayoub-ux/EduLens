import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory rate limiter (resets on server restart; use Redis/Upstash in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;       // max requests
const RATE_WINDOW_MS = 60_000; // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

function isValidScores(scores: unknown): scores is Record<string, number> {
  if (typeof scores !== "object" || scores === null || Array.isArray(scores)) return false;
  return Object.values(scores).every((v) => typeof v === "number" && v >= 0 && v <= 5);
}

export async function POST(req: Request) {
  // ── 1. Auth check ─────────────────────────────────────────────
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    // Demo mode (no Supabase configured) — allow through
  }

  // ── 2. Rate limiting ──────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // ── 3. Input validation ───────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const teacherName      = sanitize(raw.teacherName,      100);
  const subject          = sanitize(raw.subject,          80);
  const gradeLevel       = sanitize(raw.gradeLevel,       80);
  const lessonTopic      = sanitize(raw.lessonTopic,      200);
  const observationNotes = sanitize(raw.observationNotes, 1000);
  const scores           = raw.scores;

  if (!teacherName || !subject || !gradeLevel || !lessonTopic) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!isValidScores(scores)) {
    return NextResponse.json({ error: "Invalid scores format" }, { status: 400 });
  }

  // ── 4. AI generation ──────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (apiKey && !apiKey.startsWith("your-")) {
    const scoresText = Object.entries(scores)
      .map(([cat, score]) => `- ${cat}: ${score}/5`)
      .join("\n");

    const prompt = `أنت مشرف تربوي خبير ومتمرس. قم بتحليل نتائج تقييم الحصة التالية وأنتج تغذية راجعة احترافية وبناءة باللغة العربية.

معلومات الحصة:
- اسم المعلم: ${teacherName}
- المادة: ${subject}
- الصف: ${gradeLevel}
- موضوع الدرس: ${lessonTopic}

نتائج التقييم (من 5):
${scoresText}

ملاحظات المشرف:
${observationNotes || "لا توجد ملاحظات إضافية"}

أنتج استجابتك بصيغة JSON بالبنية التالية فقط، بدون أي نص خارج الـ JSON:
{
  "strengths": "نقاط القوة - فقرة واحدة متماسكة أو قائمة بالنقاط",
  "improvements": "مجالات التحسين - فقرة أو نقاط واضحة وبناءة",
  "recommendations": "توصيات عملية قابلة للتطبيق في الفصل",
  "developmentPlan": "خطة تطوير مهني مقترحة للمعلم",
  "summary": "ملخص موجز للزيارة في 2-3 جمل"
}

القواعد:
- كن احترافياً وبناءً وداعماً
- تجنب اللغة الجارحة أو الحكم الشخصي
- استند فقط إلى المعطيات المقدمة
- قدم توصيات عملية وقابلة للتطبيق`;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edulens.vercel.app",
          "X-Title": "EduLens",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(parsed);
        }
      }
    } catch {
      // Fall through to smart fallback
    }
  }

  // Smart template-based fallback
  return NextResponse.json(
    generateSmartFeedback({ teacherName, subject, gradeLevel, lessonTopic, scores, observationNotes })
  );
}

function generateSmartFeedback({ teacherName, subject, lessonTopic, scores, observationNotes }: {
  teacherName: string; subject: string; gradeLevel: string; lessonTopic: string;
  scores: Record<string, number>; observationNotes: string;
}) {
  const vals = Object.values(scores).filter(Boolean) as number[];
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;

  const highScores = Object.entries(scores).filter(([, v]) => v >= 4).map(([k]) => LABELS[k] ?? k);
  const lowScores  = Object.entries(scores).filter(([, v]) => v <= 2).map(([k]) => LABELS[k] ?? k);
  const midScores  = Object.entries(scores).filter(([, v]) => v === 3).map(([k]) => LABELS[k] ?? k);

  const level = avg >= 4.5 ? "ممتاز" : avg >= 3.5 ? "جيد جداً" : avg >= 2.5 ? "جيد" : "بحاجة إلى تطوير";

  const strengths = highScores.length > 0
    ? `أظهر الأستاذ ${teacherName} أداءً ${level} خلال حصة ${subject} بموضوع "${lessonTopic}". وتجلّت نقاط القوة بوضوح في: ${highScores.join("، ")}. ${observationNotes ? `وقد لوحظ كذلك: ${observationNotes.slice(0, 150)}.` : ""}`
    : `أبدى الأستاذ ${teacherName} التزاماً واضحاً بتحضير الدرس وتقديمه بأسلوب منظم في حصة ${subject}.`;

  const improvements = lowScores.length > 0
    ? `تبيّن من خلال الزيارة أن ثمة مجالات تستحق الاهتمام والتطوير، وأبرزها: ${lowScores.join("، ")}. ${midScores.length > 0 ? `كما يُنصح بتعزيز: ${midScores.join("، ")}.` : ""}`
    : midScores.length > 0
    ? `يُوصى بتطوير الأداء في المجالات التالية للوصول إلى مستوى الامتياز: ${midScores.join("، ")}.`
    : "الأداء العام مُرضٍ، ويُنصح بالاستمرار في التطوير المهني المستمر.";

  const recommendations = [
    highScores.length > 0 ? `الاستمرار في تعزيز ${highScores[0]} وتوظيفها بفاعلية أكبر.` : null,
    lowScores.length > 0  ? `وضع خطة عملية لتحسين ${lowScores[0]} مع التركيز على التطبيق الصفي.` : null,
    "تبادل الخبرات مع الزملاء المتميزين من خلال جلسات التعلم المهني المشترك.",
    "توظيف استراتيجيات التعلم النشط والتفاعلي لرفع مستوى مشاركة الطلاب.",
    "تنويع أساليب التقييم التكويني خلال الحصة للتحقق من فهم الطلاب.",
  ].filter(Boolean).join("\n• ");

  const developmentPlan = `الشهر الأول: حضور ورش عمل في ${lowScores[0] ?? "التدريس الفعّال"} والاطلاع على أحدث الممارسات التربوية.
الشهر الثاني: تطبيق الاستراتيجيات الجديدة في الفصل وتوثيق الملاحظات والنتائج.
الشهر الثالث: زيارة زملاء متميزين وتبادل الخبرات، مع مراجعة ذاتية شاملة للأداء.
الشهر الرابع: إعداد ملف إنجاز يوثّق التطور المهني ومشاركته في اجتماعات الفريق التعليمي.`;

  const summary = `تمت زيارة الأستاذ ${teacherName} في حصة ${subject} بموضوع "${lessonTopic}"، وحصل على تقدير إجمالي ${level} بمتوسط ${avg.toFixed(1)} من 5. ${avg >= 3.5 ? "أظهر المعلم كفاءة تدريسية واضحة." : "تُشير النتائج إلى إمكانات واعدة تستدعي الدعم والتوجيه."} يُوصى باستمرار المتابعة الإشرافية.`;

  return { strengths, improvements, recommendations: `• ${recommendations}`, developmentPlan, summary };
}

const LABELS: Record<string, string> = {
  "تخطيط الدرس": "تخطيط الدرس",
  "إدارة الفصل": "إدارة الفصل",
  "مشاركة الطلاب": "مشاركة الطلاب",
  "استراتيجيات التدريس": "استراتيجيات التدريس",
  "وضوح الشرح": "وضوح الشرح",
  "التقييم أثناء الدرس": "التقييم أثناء الدرس",
  "توظيف الموارد": "توظيف الموارد",
  "مراعاة الفروق الفردية": "مراعاة الفروق الفردية",
  "إدارة الوقت": "إدارة الوقت",
  "الفاعلية العامة": "الفاعلية العامة",
};
