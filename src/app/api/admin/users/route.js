import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 403 });
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")  || "1");
    const limit  = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const query  = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
    return NextResponse.json({ success: true, users, total });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
