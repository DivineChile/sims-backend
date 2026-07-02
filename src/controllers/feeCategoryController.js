import { supabaseAdmin } from "../config/supabaseAdmin.js";

// CREATE FEE CATEGORY
export const createFeeCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Fee category name required",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("fee_categories")
      .insert({
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// GET ALL FEE CATEGORIES
export const getFeeCategories = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("fee_categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

// UPDATE CATEGORY
export const updateFeeCategory = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("fee_categories")
    .update(req.body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

// DELETE CATEGORY
export const deleteFeeCategory = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("fee_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    message: "Fee category deleted",
  });
};
