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

    // 1. CREATE AUTH USER
    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) return res.status(400).json({ error: error.message });

    const userId = data.user.id;

    // 2. INSERT USERS TABLE
    await supabaseAdmin.from("users").insert({
      id: userId,
      full_name,
      email,
      role,
    });

    // 3. STUDENT
    if (role === "student") {
      await supabaseAdmin.from("students").insert({
        user_id: userId,
        matric_number,
        department_id,
        level,
      });
    }

    // 4. LECTURER
    if (role === "lecturer") {
      await supabaseAdmin.from("lecturers").insert({
        user_id: userId,
        department_id,
      });
    }

    return res.json({ message: "User created successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*");

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};