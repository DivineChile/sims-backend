import { supabaseAdmin } from "../config/supabaseAdmin.js";

import { SEED_CONFIG } from "./config.js";

export async function seedAcademic() {
  console.log("Creating academic sessions...");

  const { data: session, error } = await supabaseAdmin
    .from("academic_sessions")
    .insert({
      name: SEED_CONFIG.academicSession,

      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const semesters = SEED_CONFIG.semesters.map((name) => ({
    name,

    is_active: true,
  }));

  const { error: semesterError } = await supabaseAdmin
    .from("semesters")
    .insert(semesters);

  if (semesterError) {
    throw semesterError;
  }

  console.log("Academic data created");

  return session;
}
