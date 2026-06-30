import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import TeacherForm from "@/components/TeacherForm";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let teacher: any = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    teacher = data;
  } catch {}
  if (!teacher) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#091426] mb-6">تعديل بيانات المعلم</h1>
      <TeacherForm teacher={teacher} />
    </div>
  );
}
