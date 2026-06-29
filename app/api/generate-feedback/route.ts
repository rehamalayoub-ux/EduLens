import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { teacherName, subject, gradeLevel, lessonTopic, scores, observationNotes, categoryNotes } = body;

  const scoresText = Object.entries(scores as Record<string, number>)
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
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edulens.app",
        "X-Title": "EduLens",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4-5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
