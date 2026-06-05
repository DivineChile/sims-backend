import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      role,
      matric_number,
      department_id,
      level,
    } = req.body;

    // 1. Create auth user
    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;

    // 2. Insert into users table
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      full_name,
      email,
      role,
    });

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // 3. Student
    if (role === "student") {
      const { error: studentError } = await supabaseAdmin
        .from("students")
        .insert({
          user_id: userId,
          matric_number,
          department_id,
          level,
        });

      if (studentError) {
        return res.status(400).json({ error: studentError.message });
      }
    }

    // 4. Lecturer
    if (role === "lecturer") {
      const { error: lecturerError } = await supabaseAdmin
        .from("lecturers")
        .insert({
          user_id: userId,
          department_id,
        });

      if (lecturerError) {
        return res.status(400).json({ error: lecturerError.message });
      }
    }

    return res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};