import { supabaseAdmin } from "../config/supabaseAdmin.js";

// GET ALL COURSES
export const getCourses = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(`
      id,
      course_code,
      title,
      unit,
      level,
      department_id,
      semester_id,
      departments (name),
      semesters (name)
    `);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
};

// CREATE COURSE
export const createCourse = async (req, res) => {
  const {
    course_code,
    title,
    unit,
    level,
    department_id,
    semester_id,
  } = req.body;

  const { error } = await supabaseAdmin
    .from("courses")
    .insert({
      course_code,
      title,
      unit,
      level,
      department_id,
      semester_id, // ✅ NOW REQUIRED
    });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Course created successfully" });
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("courses")
    .update(req.body)
    .eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Course updated successfully" });
};

// DELETE COURSE (SOFT IDEA OPTIONAL)
export const deleteCourse = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Course deleted" });
};