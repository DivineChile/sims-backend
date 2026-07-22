import { supabaseAdmin } from "../config/supabaseAdmin.js";

import { SEED_CONFIG } from "./config.js";

import { createSeedUser } from "./seedUsers.js";

export async function seedStudents() {
  console.log("Creating students...");

  const { data: departments } = await supabaseAdmin
    .from("departments")
    .select("*");

  const students = [];

  for (const dept of departments) {
    for (let i = 1; i <= SEED_CONFIG.studentsPerDepartment; i++) {
      const matric = `2025/HND2/${dept.name
        .substring(0, 4)
        .toUpperCase()}/${String(i).padStart(3, "0")}`;

      const userId = await createSeedUser({
        email: `${matric}@school.com`,

        full_name: `Student ${i}`,

        role: "student",
      });

      students.push({
        user_id: userId,

        matric_number: matric,

        department_id: dept.id,

        level: 2,
      });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("students")
    .insert(students)
    .select();

  if (error) throw error;

  console.log(`${data.length} students created`);

  return data;
}
