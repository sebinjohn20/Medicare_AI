import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import Schedule from "@/models/Schedule";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    if (!dateStr) return NextResponse.json({ success: false, message: "Date required" }, { status: 400 });

    const doctor = await Doctor.findById(params.id);
    if (!doctor) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });

    const date = new Date(dateStr);
    const dayStart = new Date(date); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(date); dayEnd.setHours(23,59,59,999);

    const schedule = await Schedule.findOne({ doctorId: params.id, date: { $gte: dayStart, $lt: dayEnd } });
    if (schedule && (schedule.isHoliday || schedule.isEmergencyLeave)) {
      return NextResponse.json({ success: true, slots: [], message: schedule.leaveReason || "Doctor unavailable" });
    }

    const startTime = schedule?.startTime || doctor.workingHours.start;
    const endTime = schedule?.endTime || doctor.workingHours.end;
    const slotDuration = schedule?.slotDuration || doctor.slotDuration;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const slots = [];
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current + slotDuration <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, "0");
      const m = (current % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      current += slotDuration;
    }

    const booked = await Appointment.find({
      doctorId: params.id,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");
    const bookedSlots = booked.map((a) => a.timeSlot);

    const availableSlots = slots.map((slot) => ({
      time: slot,
      available: !bookedSlots.includes(slot),
    }));

    return NextResponse.json({ success: true, slots: availableSlots });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
