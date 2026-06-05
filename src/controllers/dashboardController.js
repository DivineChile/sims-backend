import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const getAdminStats = async (_, res) => {
  try {
    const [students, lecturers, courses, departments] = await Promise.all([
      supabaseAdmin.from("students").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("lecturers").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("courses").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("departments").select("id", { count: "exact", head: true }),
    ]);

    return res.json({
      students: students.count || 0,
      lecturers: lecturers.count || 0,
      courses: courses.count || 0,
      departments: departments.count || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};