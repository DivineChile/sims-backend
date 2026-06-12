import { supabaseAdmin } from "../config/supabaseAdmin.js";

// GET ALL STUDENTS
export const getStudents = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select(`
      id,
      matric_number,
      level,
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

// GET CURRENT STUDENT
export const getCurrentStudent = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } =
      await supabaseAdmin
        .from("students")
        .select(`
          *,
          departments(name)
        `)
        .eq("user_id", userId)
        .single();

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

export const createStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      matric_number,
      department_id,
      level,
    } = req.body;

    if (
      !email ||
      !password ||
      !full_name ||
      !matric_number ||
      !department_id ||
      !level
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // 1. CREATE AUTH USER
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

    // 2. CREATE USER PROFILE (ROLE TABLE)
    const { error: userError } =
      await supabaseAdmin.from("users").insert({
        id: userId,
        full_name,
        email,
        role: "student",
      });

    if (userError) {
      // rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return res.status(400).json({
        error: userError.message,
      });
    }

    // 3. CREATE STUDENT PROFILE
    const { error: studentError } =
      await supabaseAdmin.from("students").insert({
        user_id: userId,
        matric_number,
        department_id,
        level,
      });

    if (studentError) {
      // rollback both auth + users
      await supabaseAdmin.auth.admin.deleteUser(userId);

      await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", userId);

      return res.status(400).json({
        error: studentError.message,
      });
    }

    res.status(201).json({
      message: "Student created successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
  const { id } = req.params;

  const {
    full_name,
    email,
    matric_number,
    level,
    department_id,
  } = req.body;

  // 1. GET student to retrieve user_id
  const { data: student, error: fetchError } =
    await supabaseAdmin
      .from("students")
      .select("user_id")
      .eq("id", id)
      .single();

  if (fetchError || !student) {
    return res.status(404).json({
      error: "Student not found",
    });
  }

  const userId = student.user_id;

  // 2. UPDATE USERS TABLE (auth profile data)
  const { error: userError } = await supabaseAdmin
    .from("users")
    .update({
      full_name,
      email,
    })
    .eq("id", userId);

  if (userError) {
    return res.status(400).json({
      error: userError.message,
    });
  }

  // 3. UPDATE STUDENT TABLE (academic data)
  const { error: studentError } = await supabaseAdmin
    .from("students")
    .update({
      matric_number,
      level,
      department_id,
    })
    .eq("id", id);

  if (studentError) {
    return res.status(400).json({
      error: studentError.message,
    });
  }

  res.json({
    message: "Student updated successfully",
  });
};

// SOFT DELETE (DEACTIVATE)
export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("students")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({ message: "Student deactivated" });
};