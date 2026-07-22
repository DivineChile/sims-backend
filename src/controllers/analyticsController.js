import { supabaseAdmin } from "../config/supabaseAdmin.js";

const buildEnrollment = (students) => {
  const byDepartment = {};
  const byLevel = {};

  students.forEach((s) => {
    const dept = s.departments?.name || "Unassigned";
    const level = s.level || "Unassigned";

    byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    byLevel[level] = (byLevel[level] || 0) + 1;
  });

  return {
    total: students.length,
    byDepartment: Object.entries(byDepartment).map(([department, count]) => ({
      department,
      count,
    })),
    byLevel: Object.entries(byLevel).map(([level, count]) => ({
      level,
      count,
    })),
  };
};

const buildAttendance = (records) => {
  const byCourse = {};

  records.forEach((r) => {
    const course = r.attendance_sessions?.courses;
    const key = course?.course_code || "Unknown";

    if (!byCourse[key]) {
      byCourse[key] = {
        course: key,
        title: course?.title || "",
        department: course?.departments?.name || "Unassigned",
        present: 0,
        total: 0,
      };
    }

    byCourse[key].total += 1;

    if (r.status === "present") {
      byCourse[key].present += 1;
    }
  });

  const courses = Object.values(byCourse).map((c) => ({
    ...c,
    rate: c.total ? Math.round((c.present / c.total) * 100) : 0,
  }));

  const byDepartment = {};

  courses.forEach((c) => {
    if (!byDepartment[c.department]) {
      byDepartment[c.department] = { department: c.department, present: 0, total: 0 };
    }

    byDepartment[c.department].present += c.present;
    byDepartment[c.department].total += c.total;
  });

  const departments = Object.values(byDepartment).map((d) => ({
    ...d,
    rate: d.total ? Math.round((d.present / d.total) * 100) : 0,
  }));

  return { courses, departments };
};

const buildResultsPerformance = (results) => {
  const byCourse = {};

  results.forEach((r) => {
    const course = r.results_sessions?.courses;
    const key = course?.course_code || "Unknown";

    if (!byCourse[key]) {
      byCourse[key] = {
        course: key,
        title: course?.title || "",
        department: course?.departments?.name || "Unassigned",
        totalScoreSum: 0,
        count: 0,
        passCount: 0,
        gradeDistribution: { A: 0, AB: 0, B: 0, BC: 0, C: 0, CD: 0, D: 0, E: 0, F: 0 },
      };
    }

    const entry = byCourse[key];

    entry.totalScoreSum += r.total_score || 0;
    entry.count += 1;

    if (r.grade !== "F") {
      entry.passCount += 1;
    }

    if (entry.gradeDistribution[r.grade] !== undefined) {
      entry.gradeDistribution[r.grade] += 1;
    }
  });

  const courses = Object.values(byCourse).map((c) => ({
    course: c.course,
    title: c.title,
    department: c.department,
    avgScore: c.count ? Math.round((c.totalScoreSum / c.count) * 10) / 10 : 0,
    passRate: c.count ? Math.round((c.passCount / c.count) * 100) : 0,
    gradeDistribution: c.gradeDistribution,
  }));

  const overallCount = results.length;
  const overallScoreSum = results.reduce((sum, r) => sum + (r.total_score || 0), 0);
  const overallPassCount = results.filter((r) => r.grade !== "F").length;

  const byDepartment = {};

  results.forEach((r) => {
    const dept = r.results_sessions?.courses?.departments?.name || "Unassigned";

    if (!byDepartment[dept]) {
      byDepartment[dept] = { department: dept, totalScoreSum: 0, count: 0, passCount: 0 };
    }

    byDepartment[dept].totalScoreSum += r.total_score || 0;
    byDepartment[dept].count += 1;

    if (r.grade !== "F") {
      byDepartment[dept].passCount += 1;
    }
  });

  const departments = Object.values(byDepartment).map((d) => ({
    department: d.department,
    avgScore: d.count ? Math.round((d.totalScoreSum / d.count) * 10) / 10 : 0,
    passRate: d.count ? Math.round((d.passCount / d.count) * 100) : 0,
  }));

  return {
    overallAvgScore: overallCount
      ? Math.round((overallScoreSum / overallCount) * 10) / 10
      : 0,
    overallPassRate: overallCount
      ? Math.round((overallPassCount / overallCount) * 100)
      : 0,
    courses,
    departments,
  };
};

export const getAnalyticsOverview = async (req, res) => {
  try {
    const [studentsRes, attendanceRes, resultsRes] = await Promise.all([
      supabaseAdmin.from("students").select(`
        id,
        level,
        department_id,
        departments (
          name
        )
      `),
      supabaseAdmin.from("attendance_records").select(`
        id,
        status,
        attendance_sessions (
          course_id,
          courses (
            course_code,
            title,
            department_id,
            departments (
              name
            )
          )
        )
      `),
      supabaseAdmin
        .from("results")
        .select(
          `
        id,
        total_score,
        grade,
        results_sessions!inner (
          is_published,
          courses (
            course_code,
            title,
            department_id,
            departments (
              name
            )
          )
        )
      `,
        )
        .eq("results_sessions.is_published", true),
    ]);

    if (studentsRes.error) {
      return res.status(400).json({ error: studentsRes.error.message });
    }

    if (attendanceRes.error) {
      return res.status(400).json({ error: attendanceRes.error.message });
    }

    if (resultsRes.error) {
      return res.status(400).json({ error: resultsRes.error.message });
    }

    res.json({
      enrollment: buildEnrollment(studentsRes.data),
      attendance: buildAttendance(attendanceRes.data),
      results: buildResultsPerformance(resultsRes.data),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
