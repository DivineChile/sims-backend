import { supabaseAdmin } from "../config/supabaseAdmin.js";

export async function seedRegistrations() {
  console.log("Creating course registrations...");

  // Get students

  const { data: students, error: studentError } = await supabaseAdmin
    .from("students")
    .select("*");

  if (studentError) throw studentError;

  // Get courses

  const { data: courses, error: courseError } = await supabaseAdmin
    .from("courses")
    .select("*");

  if (courseError) throw courseError;

  // Academic session

  const { data: sessions } = await supabaseAdmin
    .from("academic_sessions")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!sessions) throw new Error("No active academic session");

  // semesters

  const { data: semesters } = await supabaseAdmin.from("semesters").select("*");

  const registrations = [];

  students.forEach((student) => {
    const studentCourses = courses.filter(
      (course) =>
        course.department_id === student.department_id &&
        course.level === student.level,
    );

    studentCourses.forEach((course) => {
      registrations.push({
        student_id: student.id,

        course_id: course.id,

        session_id: sessions.id,

        semester_id: course.semester_id,
      });
    });
  });

  const { data, error } = await supabaseAdmin
    .from("course_registrations")
    .insert(registrations)
    .select();

  if (error) throw error;

  console.log(`${data.length} registrations created`);

  return data;
}
