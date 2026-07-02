import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const createUser = async (req, res) => {
  let userId = null;

  try {
    const {
      email,
      password,
      full_name,
      role,

      matric_number,
      department_id,
      level,

      admin_unit_id,
    } = req.body;

    // =============================
    // VALIDATION
    // =============================

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        error: "Required fields missing",
      });
    }

    // =============================
    // 1. CREATE AUTH USER
    // =============================

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

    userId = authData.user.id;

    // =============================
    // 2. CREATE USERS RECORD
    // =============================

    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,

      full_name,

      email,

      role,
    });

    if (userError) {
      throw userError;
    }

    // =============================
    // 3. STUDENT PROFILE
    // =============================

    if (role === "student") {
      const { error } = await supabaseAdmin.from("students").insert({
        user_id: userId,

        matric_number,

        department_id,

        level,
      });

      if (error) {
        throw error;
      }
    }

    // =============================
    // 4. LECTURER PROFILE
    // =============================

    if (role === "lecturer") {
      const { error } = await supabaseAdmin.from("lecturers").insert({
        user_id: userId,

        department_id,
      });

      if (error) {
        throw error;
      }
    }

    // =============================
    // 5. ADMIN PROFILE
    // =============================

    if (role === "admin") {
      if (!admin_unit_id) {
        throw new Error("Admin unit is required");
      }

      const { error } = await supabaseAdmin.from("admin_profiles").insert({
        user_id: userId,

        admin_unit_id,
      });

      if (error) {
        throw error;
      }
    }

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.error(err);

    // =============================
    // ROLLBACK
    // =============================

    if (userId) {
      // remove auth user

      await supabaseAdmin.auth.admin.deleteUser(userId);

      // remove users record

      await supabaseAdmin.from("users").delete().eq("id", userId);
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getUsers = async (_, res) => {
  const { data, error } = await supabaseAdmin.from("users").select("*");

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};
