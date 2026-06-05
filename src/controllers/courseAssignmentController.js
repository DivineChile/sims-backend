import { supabaseAdmin } from "../config/supabaseAdmin.js";


// =============================
// GET ALL ASSIGNMENTS
// =============================
export const getAssignments = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("course_assignments")
    .select(`
        id,
        course_id,
        lecturer_id,
        session_id,
        semester_id,
        courses (course_code, title),
        lecturers (
            id,
            users (full_name)
        ),
        academic_sessions (name),
        semesters (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
};


// =============================
// CREATE ASSIGNMENT
// =============================
export const assignCourse = async (req, res) => {
  const {
    course_id,
    lecturer_id,
    session_id,
    semester_id,
  } = req.body;

  // prevent duplicates
  const { data: existing } = await supabaseAdmin
    .from("course_assignments")
    .select("*")
    .eq("course_id", course_id)
    .eq("lecturer_id", lecturer_id)
    .eq("session_id", session_id)
    .eq("semester_id", semester_id)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({
      error: "Assignment already exists",
    });
  }

  const { error } = await supabaseAdmin
    .from("course_assignments")
    .insert({
      course_id,
      lecturer_id,
      session_id,
      semester_id,
    });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Course assigned successfully" });
};

export const updateAssignment = async (req, res) => {
  const { id } = req.params;

  const {
    course_id,
    lecturer_id,
    session_id,
    semester_id,
  } = req.body;

  // prevent duplicate conflict (excluding current record)
  const { data: existing } = await supabaseAdmin
    .from("course_assignments")
    .select("*")
    .eq("course_id", course_id)
    .eq("lecturer_id", lecturer_id)
    .eq("session_id", session_id)
    .eq("semester_id", semester_id)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({
      error: "Another identical assignment already exists",
    });
  }

  const { error } = await supabaseAdmin
    .from("course_assignments")
    .update({
      course_id,
      lecturer_id,
      session_id,
      semester_id,
    })
    .eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Assignment updated successfully" });
};

// =============================
// DELETE ASSIGNMENT
// =============================
export const deleteAssignment = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("course_assignments")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Assignment deleted" });
};