import { supabaseAdmin } from "../config/supabaseAdmin.js";

// ======================================
// CREATE FEE STRUCTURE
// ======================================

export const createFeeStructure = async (req, res) => {
  try {
    const {
      name,
      department_id,
      level,
      semester_id,
      academic_session_id,
      items,
    } = req.body;

    if (
      !name ||
      !department_id ||
      !level ||
      !semester_id ||
      !academic_session_id ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // 1. CREATE STRUCTURE

    const { data: structure, error: structureError } = await supabaseAdmin
      .from("fee_structures")
      .insert({
        name,
        department_id,
        level,
        semester_id,
        academic_session_id,
      })
      .select()
      .single();

    if (structureError) {
      return res.status(400).json({
        error: structureError.message,
      });
    }

    // 2. CREATE ITEMS

    const structureItems = items.map((item) => ({
      fee_structure_id: structure.id,

      fee_category_id: item.fee_category_id,

      amount: item.amount,
    }));

    const { error: itemError } = await supabaseAdmin
      .from("fee_structure_items")
      .insert(structureItems);

    if (itemError) {
      // rollback structure

      await supabaseAdmin
        .from("fee_structures")
        .delete()
        .eq("id", structure.id);

      return res.status(400).json({
        error: itemError.message,
      });
    }

    res.status(201).json({
      message: "Fee structure created successfully",

      id: structure.id,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// GET ALL STRUCTURES
// ======================================

export const getFeeStructures = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("fee_structures")
    .select(
      `

        id,
        name,
        level,
        is_active,


        departments(
            name
        ),


        semesters(
            name
        ),


        academic_sessions(
            name
        ),


        fee_structure_items(

            amount,

            fee_categories(
                name
            )

        )

    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

// ======================================
// GET SINGLE STRUCTURE
// ======================================

export const getFeeStructure = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("fee_structures")
    .select(
      `

        *,

        departments(
            name
        ),

        semesters(
            name
        ),

        academic_sessions(
            name
        ),


        fee_structure_items(

            id,

            amount,


            fee_categories(
                id,
                name
            )

        )

    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

export const updateFeeStructure = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("fee_structures")
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

export const deleteFeeStructure = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("fee_structures")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    message: "Fee structure deleted",
  });
};
