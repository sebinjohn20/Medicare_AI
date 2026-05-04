import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { requireAdmin } from "@/lib/getUser";

export async function PATCH(request, { params }) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    const body   = await request.json();
    const doctor = await Doctor.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, doctor });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    await Doctor.findByIdAndUpdate(params.id, { isActive: false });
    return NextResponse.json({ success: true, message: "Doctor deactivated" });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
