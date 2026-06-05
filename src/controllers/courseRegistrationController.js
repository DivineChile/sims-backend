import { supabaseAdmin } from "../config/supabaseAdmin.js";

/**
 * GET ACTIVE ACADEMIC CONTEXT
 */
const getActiveAcademicContext = async () => {
  const { data: session, error: sessionError } =
    await supabaseAdmin
      .from("academic_sessions")
      .select("*")
      .eq("is_active", true)
      .single();

  const { data: semester, error: semesterError } =
    await supabaseAdmin
      .from("semesters")
      .select("*")
      .eq("is_active", true)
      .single();

  if (sessionError || semesterError) {
    throw new Error(
      "No active academic session or semester found"
    );
  }

  return {
    session_id: session.id,
    semester_id: semester.id,
  };
};

export const registerCourse = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    const { session_id, semester_id } =
      await getActiveAcademicContext();

    // 1. PREVENT DUPLICATE REGISTRATION (UPDATED LOGIC)
    const { data: existing, error: checkError } =
      await supabaseAdmin
        .from("course_registrations")
        .select("id")
        .eq("student_id", student_id)
        .eq("course_id", course_id)
        .eq("session_id", session_id)
        .eq("semester_id", semester_id)
        .maybeSingle(); // IMPORTANT FIX

    if (checkError) {
      return res.status(400).json({
        error: checkError.message,
      });
    }

    if (existing) {
      return res.status(400).json({
        error: "Course already registered",
      });
    }

    // 2. INSERT REGISTRATION
    const { error } = await supabaseAdmin
      .from("course_registrations")
      .insert({
        student_id,
        course_id,
        session_id,
        semester_id,
      });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: "Course registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const { student_id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .select(`
        id,
        course_id,
        courses (
          course_code,
          title,
          unit,
          level
        ),
        semesters (
          name
        ),
        academic_sessions (
          name
        )
      `)
      .eq("student_id", student_id);

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

export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("course_registrations")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: "Course unregistered successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const getAllRegistrations = async (_, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .select(`
        id,
        student_id,
        course_id,
        courses (
          title,
          course_code
        ),
        students (
          matric_number
        ),
        semesters (
          name
        ),
        academic_sessions (
          name
        )
      `);

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