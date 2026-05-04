import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { requireAuth, requireAdmin } from "@/lib/getUser";

export async function GET(request, { params }) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const appointment = await Appointment.findById(params.id).populate("doctorId");
    if (!appointment) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, appointment });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const body = await request.json();
    const appointment = await Appointment.findById(params.id);
    if (!appointment) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (user.role !== "admin" && appointment.patientId.toString() !== user.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const updated = await Appointment.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, appointment: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    await Appointment.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
