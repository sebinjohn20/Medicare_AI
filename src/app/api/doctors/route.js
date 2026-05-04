import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const query = { isActive: true };
    if (specialty) query.specialty = specialty;
    const doctors = await Doctor.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error("[Doctors GET]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const role = request.headers.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const doctor = await Doctor.create(body);
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch (error) {
    console.error("[Doctors POST]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
