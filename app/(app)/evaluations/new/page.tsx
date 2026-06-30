import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EvaluationWizard from "./EvaluationWizard";

export default async function NewEvaluationPage() {
  let teachers: { id: string; name: string; subject: string; grade_level: string }[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data } = await supabase
      .from("teachers")
      .select("id, name, subject, grade_level")
      .eq("user_id", user.id)
      .order("name");

    teachers = data ?? [];
  } catch {
    // Demo teachers for preview
  }

  if (teachers.length === 0) {
    teachers = [
      { id: "demo-1", name: "أحمد محمد السالم",    subject: "الرياضيات",    grade_level: "الصف العاشر" },
      { id: "demo-2", name: "فاطمة علي الزهراني",  subject: "العلوم",       grade_level: "الصف الثامن" },
      { id: "demo-3", name: "خالد عبدالله العمري", subject: "اللغة العربية", grade_level: "الصف الثاني عشر" },
    ];
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#091426]">بطاقة تقييم الحصة</h1>
        <p className="text-sm text-[#45474c] mt-1">
          قيّم أداء المعلم من خلال المحاور التالية، ثم أضف ملاحظاتك ليقوم الذكاء الاصطناعي بتوليد تغذية راجعة دقيقة.
        </p>
      </div>
      <EvaluationWizard teachers={teachers} />
    </div>
  );
}
