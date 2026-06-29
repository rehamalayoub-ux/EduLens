import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EvaluationWizard from "./EvaluationWizard";

export default async function NewEvaluationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, name, subject, grade_level")
    .eq("user_id", user.id)
    .order("name");

  if (!teachers || teachers.length === 0) {
    redirect("/teachers/new");
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
