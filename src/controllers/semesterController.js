import { supabaseAdmin } from "../config/supabaseAdmin.js";

// GET ALL SEMESTERS
export const getSemesters = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("semesters")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
};

// CREATE SEMESTER
export const createSemester = async (req, res) => {
  const { name, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from("semesters")
    .insert({
      name,
      is_active: is_active ?? false,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
};

// UPDATE SEMESTER
export const updateSemester = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("semesters")
    .update(req.body)
    .eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Semester updated" });
};

// DELETE SEMESTER
export const deleteSemester = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("semesters")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Semester deleted" });
};