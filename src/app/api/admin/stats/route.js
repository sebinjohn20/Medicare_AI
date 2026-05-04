import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { requireAdmin } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();

    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayCount, pending, completed, cancelled, users, doctors, waiting] =
      await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "cancelled" }),
        User.countDocuments({ role: "user" }),
        Doctor.countDocuments({ isActive: true }),
        Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $in: ["pending","confirmed"] } }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalAppointments: total,
        todayAppointments: todayCount,
        pendingAppointments: pending,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        totalUsers: users,
        totalDoctors: doctors,
        waitingPatients: waiting,
      },
    });
  } catch (err) {
    console.error("[Admin Stats]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
