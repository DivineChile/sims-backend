import { supabaseAdmin } from "../config/supabaseAdmin.js";

export async function seedCourses() {
  console.log("Creating courses...");

  const { data: departments, error: deptError } = await supabaseAdmin
    .from("departments")
    .select("id,name");

  if (deptError) throw deptError;

  const { data: semesters, error: semesterError } = await supabaseAdmin
    .from("semesters")
    .select("id,name");

  if (semesterError) throw semesterError;

  const courses = [];

  departments.forEach((department) => {
    semesters.forEach((semester, semesterIndex) => {
      for (let i = 1; i <= 10; i++) {
        const code =
          department.name.substring(0, 3).toUpperCase() +
          semesterIndex +
          String(i).padStart(2, "0");

        courses.push({
          course_code: code,

          title: `${department.name} Course ${i}`,

          unit: i % 3 === 0 ? 3 : 2,

          level: i <= 5 ? 1 : 2,

          department_id: department.id,

          semester_id: semester.id,
        });
      }
    });
  });

  const { data, error } = await supabaseAdmin
    .from("courses")
    .insert(courses)
    .select();

  if (error) throw error;

  console.log(`${data.length} courses created`);

  return data;
}
