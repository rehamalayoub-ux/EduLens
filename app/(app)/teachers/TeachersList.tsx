"use client";

import { useState } from "react";
import TeacherCard, { type TeacherCardData } from "./TeacherCard";

export default function TeachersList({ teachers: initial, isDemo }: {
  teachers: TeacherCardData[];
  isDemo: boolean;
}) {
  const [teachers, setTeachers] = useState(initial);

  function handleDelete(id: string) {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e0e3e5] py-16 text-center shadow-sm">
        <div className="text-4xl mb-3">👨‍🏫</div>
        <p className="text-[#45474c] font-medium">لا يوجد معلمون</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {teachers.map((t) => (
        <TeacherCard key={t.id} teacher={t} isDemo={isDemo} onDelete={handleDelete} />
      ))}
    </div>
  );
}
