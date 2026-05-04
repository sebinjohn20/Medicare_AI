import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { requireAuth } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0,0,0,0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [total, completed, cancelled, pending] = await Promise.all([
        Appointment.countDocuments({ date: { $gte: date, $lt: nextDate } }),
        Appointment.countDocuments({ date: { $gte: date, $lt: nextDate }, status: "completed" }),
        Appointment.countDocuments({ date: { $gte: date, $lt: nextDate }, status: "cancelled" }),
        Appointment.countDocuments({ date: { $gte: date, $lt: nextDate }, status: { $in: ["pending","confirmed"] } }),
      ]);

      results.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total, completed, cancelled, pending,
      });
    }
    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("[Analytics]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
