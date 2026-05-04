import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/getUser";

export async function GET(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    const notifications = await Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(20);
    const unread = await Notification.countDocuments({ userId: user.id, read: false });
    return NextResponse.json({ success: true, notifications, unread });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 401 });
    await connectDB();
    await Notification.updateMany({ userId: user.id, read: false }, { read: true });
    return NextResponse.json({ success: true, message: "All marked as read" });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
