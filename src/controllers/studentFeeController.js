import { supabaseAdmin } from "../config/supabaseAdmin.js";

// ======================================
// ASSIGN FEE STRUCTURE TO STUDENTS
// ======================================

export const assignFeeStructure = async (req, res) => {
  try {
    const { fee_structure_id } = req.body;

    if (!fee_structure_id) {
      return res.status(400).json({
        error: "Fee structure required",
      });
    }

    // 1. Get fee structure

    const { data: structure, error: structureError } = await supabaseAdmin
      .from("fee_structures")
      .select(
        `
            id,
            department_id,
            level
        `,
      )
      .eq("id", fee_structure_id)
      .single();

    if (structureError) {
      return res.status(400).json({
        error: structureError.message,
      });
    }

    // 2. Find matching students

    const { data: students, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("department_id", structure.department_id)
      .eq("level", structure.level);

    if (studentError) {
      return res.status(400).json({
        error: studentError.message,
      });
    }

    if (!students.length) {
      return res.status(400).json({
        error: "No students found for this fee structure",
      });
    }

    // 3. Generate accounts

    const accounts = students.map((student) => ({
      student_id: student.id,

      fee_structure_id: fee_structure_id,
    }));

    const { error } = await supabaseAdmin
      .from("student_fee_accounts")
      .upsert(accounts, {
        onConflict: "student_id,fee_structure_id",
      });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: `${accounts.length} student accounts created`,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// GET STUDENT FEES
// ======================================

export const getStudentFees = async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabaseAdmin
    .from("student_fee_accounts")
    .select(
      `

        id,

        status,


        fee_structures(

            name,

            semester_id,


            fee_structure_items(

                amount,


                fee_categories(
                    name
                )

            )

        ),


        verified_payments(

            amount,

            verified_at

        )

    `,
    )
    .eq("student_id", studentId);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json(data);
};

export const getStudentFeeSummary = async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabaseAdmin
    .from("student_fee_accounts")
    .select(
      `

        id,

        fee_structure_id,


        fee_structures(

            fee_structure_items(
                amount
            )

        ),


        verified_payments(
            amount
        )

    `,
    )
    .eq("student_id", studentId);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  let total = 0;

  let paid = 0;

  data.forEach((account) => {
    account.fee_structures.fee_structure_items.forEach((item) => {
      total += Number(item.amount);
    });

    account.verified_payments.forEach((payment) => {
      paid += Number(payment.amount);
    });
  });

  res.json({
    total_fee: total,

    paid,

    balance: total - paid,

    status: paid >= total ? "cleared" : paid > 0 ? "partially_paid" : "pending",
  });
};
