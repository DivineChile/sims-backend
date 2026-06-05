import { supabaseAdmin } from "../config/supabaseAdmin.js";

// GET ALL
export const getDepartments = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from("departments")
    .select("*");

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// CREATE
export const createDepartment = async (req, res) => {
  const { name, faculty } = req.body;

  const { error } = await supabaseAdmin.from("departments").insert({
    name,
    faculty,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Department created" });
};

// UPDATE
export const updateDepartment = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("departments")
    .update(req.body)
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// DELETE
export const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("departments")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Department deleted" });
};