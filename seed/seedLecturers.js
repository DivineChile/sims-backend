import { supabaseAdmin } from "../config/supabaseAdmin.js";

import { createSeedUser } from "./seedUsers.js";

export async function seedLecturers() {
  console.log("Creating lecturers...");

  const { data: departments } = await supabaseAdmin
    .from("departments")
    .select("*");

  const lecturers = [];

  let count = 1;

  for (const dept of departments) {
    for (let i = 1; i <= 5; i++) {
      const email = `lecturer${count}@school.com`;

      const userId = await createSeedUser({
        email,

        full_name: `Lecturer ${count}`,

        role: "lecturer",
      });

      lecturers.push({
        user_id: userId,

        department_id: dept.id,
      });

      count++;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("lecturers")
    .insert(lecturers)
    .select();

  if (error) throw error;

  console.log(`${data.length} lecturers created`);

  return data;
}
