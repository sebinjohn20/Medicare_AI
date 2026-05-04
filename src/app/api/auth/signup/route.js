import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || undefined,
      role: "user", // always user on self-registration
    });

    const token = createToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: user.toSafeObject(),
        token,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("[Signup Error]", error);

    // Mongoose duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message).join(", ");
      return NextResponse.json(
        { success: false, message: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
