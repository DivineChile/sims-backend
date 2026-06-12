import { supabaseAdmin } from "../config/supabaseAdmin.js";

// GET ALL LECTURERS
export const getLecturers = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("lecturers")
    .select(`
      id,
      user_id,
      department_id,
      users (
        id,
        full_name,
        email
      ),
      departments (
        id,
        name
      )
    `);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

// CREATE
export const createLecturer = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      department_id,
    } = req.body;

    // ─────────────────────────────
    // 1. CREATE AUTH USER
    // ─────────────────────────────
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({
        error: authError.message,
      });
    }

    const userId = authData.user.id;

    // ─────────────────────────────
    // 2. CREATE PROFILE (users table)
    // ─────────────────────────────
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        full_name,
        email,
        role: "lecturer",
      });

    if (userError) {
      return res.status(400).json({
        error: userError.message,
      });
    }

    // ─────────────────────────────
    // 3. CREATE LECTURER RECORD
    // ─────────────────────────────
    const { error: lecturerError } = await supabaseAdmin
      .from("lecturers")
      .insert({
        user_id: userId,
        department_id,
      });

    if (lecturerError) {
      return res.status(400).json({
        error: lecturerError.message,
      });
    }

    res.json({
      message: "Lecturer created successfully",
      user_id: userId,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// UPDATE
export const updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      department_id,
    } = req.body;

    // 1. Get lecturer → resolve user_id
    const { data: lecturer, error: fetchError } =
      await supabaseAdmin
        .from("lecturers")
        .select("user_id")
        .eq("id", id)
        .single();

    if (fetchError || !lecturer) {
      return res.status(404).json({
        error: "Lecturer not found",
      });
    }

    const userId = lecturer.user_id;

    // 2. UPDATE USERS TABLE (identity layer)
    if (full_name || email) {
      const { error: userError } = await supabaseAdmin
        .from("users")
        .update({
          ...(full_name && { full_name }),
          ...(email && { email }),
        })
        .eq("id", userId);

      if (userError) {
        return res.status(400).json({
          error: userError.message,
        });
      }
    }

    // 3. UPDATE LECTURER TABLE (domain layer only)
    const { error: lecturerError } = await supabaseAdmin
      .from("lecturers")
      .update({
        department_id,
      })
      .eq("id", id);

    if (lecturerError) {
      return res.status(400).json({
        error: lecturerError.message,
      });
    }

    res.json({
      message: "Lecturer updated successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// DEACTIVATE
export const deleteLecturer = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("lecturers")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Lecturer deactivated" });
};

// GET LECTURER DASHBOARD DATA
export const getLecturerDashboard = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // 1. Assigned courses
    const { data: assignments, error: assignError } =
      await supabaseAdmin
        .from("course_assignments")
        .select(`
          id,
          course_id,
          courses (
            id,
            course_code,
            title,
            unit
          ),
          session_id
        `)
        .eq("lecturer_id", lecturerId);

    if (assignError) {
      return res.status(400).json({ error: assignError.message });
    }

    // 2. Active sessions
    const { data: sessions } =
      await supabaseAdmin
        .from("attendance_sessions")
        .select(`
          id,
          session_date,
          course_id,
          courses (course_code)
        `)
        .eq("lecturer_id", lecturerId)
        .order("created_at", { ascending: false })
        .limit(5);

    // 3. Get ALL courses taught by lecturer
    const courseIds = assignments.map(a => a.course_id);

    // 4. Get registrations separately (SAFE WAY)
    const { data: registrations } =
      await supabaseAdmin
        .from("course_registrations")
        .select("student_id, course_id")
        .in("course_id", courseIds);

    // 5. Unique students count
    const uniqueStudents = new Set(
      registrations?.map(r => r.student_id) || []
    );

    res.json({
      courses: assignments,
      sessions,
      totalStudents: uniqueStudents.size,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLecturerByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("lecturers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};