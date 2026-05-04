import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status  = searchParams.get("status");
    const page    = parseInt(searchParams.get("page")  || "1");
    const limit   = parseInt(searchParams.get("limit") || "50");
    const search  = searchParams.get("search") || "";

    const query = {};
    if (user.role !== "admin") query.patientId = user.id;
    if (status) query.status = status;
    if (search && user.role === "admin") {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { doctorName:  { $regex: search, $options: "i" } },
      ];
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("doctorId", "name specialty avatar consultationFee")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, appointments, total, page, limit });
  } catch (err) {
    console.error("[Appointments GET]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const {
      doctorId, date, timeSlot, reason, type, patientPhone,
      // Admin-only overrides: book on behalf of a patient
      overridePatientId, overridePatientName, overridePatientEmail,
    } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, message: "Doctor, date and time slot are required" },
        { status: 400 }
      );
    }

    // Resolve patient identity
    let patientId    = user.id;
    let patientName  = user.name;
    let patientEmail = user.email;

    if (user.role === "admin" && overridePatientId) {
      // Admin booking for an existing user
      const patient = await User.findById(overridePatientId);
      if (!patient) return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
      patientId    = patient._id.toString();
      patientName  = patient.name;
      patientEmail = patient.email;
    } else if (user.role === "admin" && overridePatientName) {
      // Admin booking for a walk-in / name-only patient
      patientId    = user.id; // link to admin as placeholder
      patientName  = overridePatientName;
      patientEmail = overridePatientEmail || "";
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });

    // Check slot conflict
    const apptDate = new Date(date);
    const dayStart = new Date(apptDate); dayStart.setHours(0,0,0,0);
    const dayEnd   = new Date(apptDate); dayEnd.setHours(23,59,59,999);

    const conflict = await Appointment.findOne({
      doctorId,
      date: { $gte: dayStart, $lt: dayEnd },
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });
    if (conflict) {
      return NextResponse.json({ success: false, message: "This time slot is already booked" }, { status: 409 });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      patientName,
      patientEmail,
      patientPhone: patientPhone || "",
      doctorName:   doctor.name,
      specialty:    doctor.specialty,
      date:         new Date(date),
      timeSlot,
      type:         type || "in-person",
      reason:       reason || "",
      consultationFee: doctor.consultationFee,
      bookedVia:    user.role === "admin" ? "admin" : "manual",
      // Admin bookings are auto-confirmed
      status:       user.role === "admin" ? "confirmed" : "pending",
    });

    // Notify patient (only if real user)
    if (overridePatientId) {
      await Notification.create({
        userId:  overridePatientId,
        type:    "appointment",
        title:   "Appointment Booked by Admin",
        message: `An appointment with Dr. ${doctor.name} on ${new Date(date).toDateString()} at ${timeSlot} has been scheduled for you.`,
        link:    "/dashboard/appointments",
      });
    } else if (user.role !== "admin") {
      await Notification.create({
        userId:  user.id,
        type:    "appointment",
        title:   "Appointment Booked",
        message: `Your appointment with Dr. ${doctor.name} on ${new Date(date).toDateString()} at ${timeSlot} is pending confirmation.`,
        link:    "/dashboard/appointments",
      });
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err) {
    console.error("[Appointments POST]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
