import { supabaseAdmin } from "../config/supabaseAdmin.js";

async function clearTable(table) {
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error(`Failed clearing ${table}`, error);

    throw error;
  }

  console.log(`${table} cleared`);
}

async function clearAuthUsers() {
  console.log("Clearing auth users...");

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) throw error;

  for (const user of data.users) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }

  console.log("Auth users cleared");
}

async function resetDatabase() {
  console.log("🧹 Resetting database...");

  const tables = [
    "results",

    "results_sessions",

    "attendance",

    "course_registrations",

    "students",

    "lecturers",

    "courses",

    "semesters",

    "academic_sessions",

    "departments",

    "users",
  ];

  for (const table of tables) {
    await clearTable(table);
  }

  await clearAuthUsers();

  console.log("✅ Database reset complete");
}

resetDatabase().catch((err) => {
  console.error(err);

  process.exit(1);
});
