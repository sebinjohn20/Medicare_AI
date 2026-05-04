import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { requireAdmin } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, doctors });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    const body = await request.json();
    const doctor = await Doctor.create(body);
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
