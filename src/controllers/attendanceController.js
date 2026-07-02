import { supabaseAdmin } from "../config/supabaseAdmin.js";

// =====================================
// CREATE ATTENDANCE SESSION
// =====================================
export const createAttendanceSession = async (req, res) => {
  try {
    const { course_id, user_id } = req.body; 
    // ⚠️ lecturer_id here is actually users.id from frontend

    // STEP 1: convert user.id → lecturers.id
    const { data: lecturer, error } =
      await supabaseAdmin
        .from("lecturers")
        .select("id")
        .eq("user_id", user_id)
        .single();

    if (error || !lecturer) {
      return res.status(404).json({
        error:
          "Lecturer profile not found",
      });
    }

    const lecturerId = lecturer.id;

    // STEP 2: insert correct lecturer_id
    const { data, error: insertError } =
    await supabaseAdmin
      .from("attendance_sessions")
      .insert({
        course_id,
        lecturer_id: lecturer.id,
        session_date: new Date(),
      })
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({
        error: insertError.message,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// =====================================
// GET STUDENTS FOR ATTENDANCE
// =====================================
export const getSessionStudents = async (
  req,
  res
) => {
  try {
    const { attendanceId } = req.params;

    // find attendance session
    const {
      data: attendance,
      error: attendanceError,
    } = await supabaseAdmin
      .from("attendance_sessions")
      .select("course_id")
      .eq("id", attendanceId)
      .single();

    if (attendanceError) {
      return res.status(400).json({
        error: attendanceError.message,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .select(`
        student_id,
        students (
          id,
          matric_number,
          users (
            full_name
          )
        )
      `)
      .eq("course_id", attendance.course_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// =====================================
// MARK ATTENDANCE
// =====================================
export const markAttendance = async (
  req,
  res
) => {
  try {
    const {
      attendance_session_id,
      student_id,
      status,
    } = req.body;

    const { error } = await supabaseAdmin
      .from("attendance_records")
      .upsert({
        attendance_session_id,
        student_id,
        status,
      });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message:
        "Attendance marked successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  try {
    const {
      attendance_session_id,
      records,
    } = req.body;

    const payload = records.map((r) => ({
      attendance_session_id,
      student_id: r.student_id,
      status: r.status,
    }));

    const { error } = await supabaseAdmin
      .from("attendance_records")
      .insert(payload);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message:
        "Attendance submitted successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// =====================================
// ATTENDANCE HISTORY
// =====================================
export const getCourseAttendanceHistory =
  async (req, res) => {
    try {
      const { courseId } = req.params;

      const { data, error } =
        await supabaseAdmin
          .from("attendance_sessions")
          .select(`
            id,
            session_date,
            courses (
              course_code,
              title
            )
          `)
          .eq("course_id", courseId)
          .order("session_date", {
            ascending: false,
          });

      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      res.json(data);

    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  };

// =====================================
// GET LECTURER ASSIGNED COURSES
// =====================================
export const getLecturerCourses = async (
  req,
  res
) => {
  try {
    const { lecturerId } = req.params;

    const { data, error } =
      await supabaseAdmin
        .from("course_assignments")
        .select(`
          id,
          course_id,
          courses (
            id,
            course_code,
            title,
            unit,
            level
          )
        `)
        .eq("lecturer_id", lecturerId);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// GET STUDENTS FOR A COURSE (CRITICAL)
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .select(`
        student_id,
        students (
          id,
          matric_number,
          user_id,
          users (
            full_name
          )
        )
      `)
      .eq("course_id", courseId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET STUDENT ATTENDANCE (FULL VIEW)
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select(`
        id,
        status,
        attendance_sessions (
          session_date,
          courses (
            course_code,
            title
          ),
          lecturers (
            id
          )
        )
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // flatten response for frontend
    const formatted = data.map((r) => ({
      id: r.id,
      status: r.status,
      session_date: r.attendance_sessions?.session_date,
      course_code: r.attendance_sessions?.courses?.course_code,
      course_title: r.attendance_sessions?.courses?.title,
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET LECTURER ATTENDANCE HISTORY
export const getLecturerAttendance =
async (req,res)=>{

try{

const { userId } = req.params;


// 1. Resolve lecturer profile

const { data: lecturer, error: lecturerError }
=
await supabaseAdmin
.from("lecturers")
.select("id")
.eq(
"user_id",
userId
)
.single();



if(lecturerError || !lecturer){

return res.status(404).json({

error:
"Lecturer profile not found"

});

}



// 2. Get attendance sessions

const { data,error } =
await supabaseAdmin
.from("attendance_sessions")
.select(`
 id,
 session_date,

 courses(
   id,
   course_code,
   title
 )
`)
.eq(
"lecturer_id",
lecturer.id
)
.order(
"created_at",
{
ascending:false
}
);



if(error){

return res.status(400).json({
error:error.message
});

}



res.json(data);



}catch(err){

res.status(500).json({

error:err.message

});

}

};

//GET SESSION DETAILS
export const getAttendanceSessionDetails =
async(req,res)=>{

try{

const {
sessionId
}=req.params;



const {data,error}=await supabaseAdmin

.from("attendance_records")

.select(`
 id,
 status,

 students(
   id,
   matric_number,

   users(
     full_name
   )
 )
`)

.eq(
"attendance_session_id",
sessionId
);



if(error){

return res.status(400).json({
error:error.message
});

}



res.json(data);



}catch(err){

res.status(500).json({
error:err.message
});

}

};

// UPDATE ATTENDANCE RECORDS
export const updateAttendanceRecord =
async(req,res)=>{

try{

const {
id
}=req.params;


const {
status
}=req.body;


const {error}=await supabaseAdmin
.from("attendance_records")
.update({
status
})
.eq(
"id",
id
);



if(error){

return res.status(400).json({
error:error.message
});

}



res.json({
message:
"Attendance updated"
});


}catch(err){

res.status(500).json({
error:err.message
});

}

};