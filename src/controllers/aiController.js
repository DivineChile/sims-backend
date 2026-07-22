import { ai, GEMINI_MODEL } from "../config/gemini.js";

export const generateResultSummary = async (req, res) => {
  try {
    const { gpa, cgpa, credits, courses, bestCourse, weakestCourse, standing } =
      req.body;

    const prompt = `
You are an academic advisor writing a short performance summary for a student.

Data:
- Current semester GPA: ${gpa}
- CGPA: ${cgpa}
- Total credit units: ${credits}
- Academic standing: ${standing}
- Best course: ${bestCourse || "N/A"}
- Weakest course: ${weakestCourse || "N/A"}
- Courses this semester: ${JSON.stringify(courses || [])}

Write a short (2-4 sentence), encouraging but honest paragraph summarizing this
student's academic performance and one concrete suggestion for improvement if
needed. Do not invent any facts not present in the data above. Do not use
markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const summary = response.text.trim();

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateAdminSummary = async (req, res) => {
  try {
    const { enrollment, attendance, results } = req.body;

    const prompt = `
You are an academic operations analyst writing a short digest for a school
administrator, based on aggregated data across the whole school.

Data:
- Enrollment: ${JSON.stringify(enrollment || {})}
- Attendance rates (per course/department): ${JSON.stringify(attendance || {})}
- Results/grade performance (per course/department): ${JSON.stringify(results || {})}

Write a short (3-5 sentence), factual digest highlighting the most notable
patterns — e.g. the weakest-performing course or department, the lowest
attendance rate, or any pass-rate concerns. Do not invent any facts not
present in the data above. Do not use markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const summary = response.text.trim();

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const askAssistant = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `
You are a helpful academic assistant for a student using a school portal.
Answer the student's question using ONLY the data provided below. If the
answer cannot be determined from this data, say so honestly instead of
guessing. Keep the answer short and conversational. Do not use markdown
formatting.

Student data:
${JSON.stringify(context || {}, null, 2)}

Student question: "${question}"
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const answer = response.text.trim();

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
