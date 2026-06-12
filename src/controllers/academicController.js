import { supabaseAdmin } from "../config/supabaseAdmin.js";


// =============================
// ACTIVE CONTEXT (KEEP EXISTING)
// =============================

// GET ACTIVE SESSION
export const getActiveSession = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("academic_sessions")
    .select("id, name, is_active")
    .eq("is_active", true)
    .single();

  if (error) {
    return res.status(400).json({
      error: "No active academic session found",
    });
  }

  res.json(data);
};

// GET ACTIVE SEMESTER
export const getActiveSemester = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("semesters")
    .select("id, name, is_active")
    .eq("is_active", true)
    .single();

  if (error) {
    return res.status(400).json({
      error: "No active semester found",
    });
  }

  res.json(data);
};

// =============================
// ACADEMIC SESSIONS (NEW)
// =============================

// GET ALL SESSIONS
export const getSessions = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("academic_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// CREATE SESSION
export const createSession = async (req, res) => {
  const { name } = req.body;

  const { error } = await supabaseAdmin
    .from("academic_sessions")
    .insert({ name });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Session created" });
};

// ACTIVATE SESSION (ENSURE ONLY ONE ACTIVE)
export const setActiveSession = async (req, res) => {
  const { id } = req.params;

  // deactivate all
  await supabaseAdmin
    .from("academic_sessions")
    .update({ is_active: false })
    .neq("id", null);

  // activate selected
  const { error } = await supabaseAdmin
    .from("academic_sessions")
    .update({ is_active: true })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Active session updated" });
};


// =============================
// SEMESTERS (NEW)
// =============================

// GET ALL SEMESTERS
export const getSemesters = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("semesters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// ACTIVATE SEMESTER (ENSURE ONLY ONE ACTIVE)
export const setActiveSemester = async (req, res) => {
  const { id } = req.params;

  // deactivate all
  await supabaseAdmin
    .from("semesters")
    .update({ is_active: false })
    .neq("id", null);

  // activate selected
  const { error } = await supabaseAdmin
    .from("semesters")
    .update({ is_active: true })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Active semester updated" });
};