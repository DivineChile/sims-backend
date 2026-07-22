import { supabaseAdmin } from "../config/supabaseAdmin.js";

import { SEED_CONFIG } from "./config.js";

export async function seedDepartments() {
  console.log("Creating departments...");

  const departments = SEED_CONFIG.departments.map((name) => ({
    name,

    faculty: "School of Applied Sciences",
  }));

  const { data, error } = await supabaseAdmin
    .from("departments")
    .insert(departments)
    .select();

  if (error) throw error;

  console.log(`${data.length} departments created`);

  return data;
}
