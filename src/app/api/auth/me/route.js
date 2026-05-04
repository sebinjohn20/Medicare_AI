import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const dbUser = await User.findById(user.id);
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, user: dbUser.toSafeObject() });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
