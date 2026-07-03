import { supabaseAdmin } from "../config/supabaseAdmin.js";

const validateScore = (ca, exam) => {
  if (ca > 40) throw new Error("CA cannot exceed 40");
  if (exam > 60) throw new Error("Exam cannot exceed 60");
};

const calculateGrade = (score) => {
  if (score >= 75) return "A";
  if (score >= 70) return "AB";
  if (score >= 65) return "B";
  if (score >= 60) return "BC";
  if (score >= 55) return "C";
  if (score >= 50) return "CD";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};

// CREATE OR RETURN EXISTING SESSION
export const createOrGetSession = async (req, res) => {
  try {
    const { course_id, lecturer_id, semester_id } = req.body;

    // CHECK IF SESSION EXISTS
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("results_sessions")
      .select("*")
      .eq("course_id", course_id)
      .eq("semester_id", semester_id)
      .single();

    if (existing) {
      return res.json(existing);
    }

    // CREATE NEW SESSION
    const { data, error } = await supabaseAdmin
      .from("results_sessions")
      .insert({
        course_id,
        lecturer_id,
        semester_id,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSessionByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("results_sessions")
      .select("*")
      .eq("course_id", courseId)
      .single();

    if (error) {
      return res.json(null); // IMPORTANT: frontend expects null
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSessionRecords = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("results")
      .select(
        `
        id,
        student_id,
        ca_score,
        exam_score,
        total_score,
        grade,
        students (
          matric_number,
          users (
            full_name
          )
        )
      `,
      )
      .eq("results_session_id", sessionId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateResultRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { ca_score, exam_score } = req.body;

    const total_score = Number(ca_score) + Number(exam_score);

    const grade = calculateGrade(total_score);

    const { error } = await supabaseAdmin
      .from("results")
      .update({
        ca_score,
        exam_score,
        grade,
      })
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createBulkResults = async (req, res) => {
  try {
    const { results_session_id, records } = req.body;

    const formatted = records.map((r) => {
      const total_score = Number(r.ca_score) + Number(r.exam_score);

      return {
        results_session_id,
        student_id: r.student_id,
        ca_score: r.ca_score,
        exam_score: r.exam_score,
        grade: calculateGrade(total_score),
      };
    });

    // 🔥 UPSERT INSTEAD OF INSERT
    const { error } = await supabaseAdmin.from("results").upsert(formatted, {
      onConflict: "results_session_id,student_id",
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Results saved/updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("results")
      .select(
        `
        id,
        ca_score,
        exam_score,
        total_score,
        grade,
        results_session_id,
        course:course_id (
          course_code,
          title,
          unit
        ),
        semester:semester_id (
          name
        )
      `,
      )
      .eq("student_id", studentId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
