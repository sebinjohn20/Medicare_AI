import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import Doctor from "@/models/Doctor";
import { requireAuth } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date     = searchParams.get("date");
    const query    = {};
    if (doctorId) query.doctorId = doctorId;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const n = new Date(d);    n.setDate(n.getDate() + 1);
      query.date = { $gte: d, $lt: n };
    }
    const schedules = await Schedule.find(query).populate("doctorId", "name specialty");
    return NextResponse.json({ success: true, schedules });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const body = await request.json();
    const { doctorId, date, startTime, endTime, slotDuration, isHoliday, isEmergencyLeave, leaveReason } = body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const totalMins  = (eh * 60 + em) - (sh * 60 + sm);
    const maxPatients = Math.floor(totalMins / (slotDuration || 30));

    const d = new Date(date); d.setHours(0,0,0,0);
    const n = new Date(d);    n.setDate(n.getDate() + 1);

    const schedule = await Schedule.findOneAndUpdate(
      { doctorId, date: { $gte: d, $lt: n } },
      {
        doctorId, date: new Date(date), startTime, endTime,
        slotDuration: slotDuration || 30,
        isHoliday:         !!isHoliday,
        isEmergencyLeave:  !!isEmergencyLeave,
        leaveReason,
        maxPatients,
        status: isHoliday || isEmergencyLeave ? "cancelled" : "active",
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, schedule });
  } catch (err) {
    console.error("[Schedule POST]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
