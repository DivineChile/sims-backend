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

// GET AVAILABLE COURSES
export const getAvailableCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    // student profile
    const { data: student, error: studentError } =
      await supabaseAdmin
        .from("students")
        .select(`
          id,
          level,
          department_id
        `)
        .eq("id", studentId)
        .single();

    if (studentError) {
      return res.status(400).json({
        error: studentError.message,
      });
    }

    // active semester
    const { data: semester, error: semesterError } =
      await supabaseAdmin
        .from("semesters")
        .select("id")
        .eq("is_active", true)
        .single();

    if (semesterError || !semester) {
      return res.status(400).json({
        error: "No active semester found",
      });
    }

    // courses matching student
    const { data, error } =
      await supabaseAdmin
        .from("courses")
        .select(`
          *,
          departments(name),
          semesters(name)
        `)
        .eq("department_id", student.department_id)
        .eq("level", student.level)
        .eq("semester_id", semester.id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
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