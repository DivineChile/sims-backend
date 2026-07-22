import { seedAcademic } from "./seedAcademic.js";

import { seedDepartments } from "./seedDepartments.js";

import { seedCourses } from "./seedCourses.js";

import { seedUsers } from "./seedUsers.js";

import { seedStudents } from "./seedStudents.js";

import { seedLecturers } from "./seedLecturers.js";
import { seedRegistrations } from "./seedRegistrations.js";

async function run() {
  console.log(
    `
==============================
 STUDENT INFORMATION SYSTEM
 DATABASE SEED
==============================
`,
  );

  await seedAcademic();

  await seedDepartments();

  await seedCourses();

  await seedUsers();

  await seedStudents();

  await seedLecturers();

  await seedRegistrations();

  console.log("✅ Seed completed");
}

run().catch((err) => {
  console.error("❌ Seed failed", err);

  process.exit(1);
});
