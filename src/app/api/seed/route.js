import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";

const DEMO_DOCTORS = [
  { name: "Dr. Ananya Sharma",  email: "ananya@hospital.com",  specialty: "Cardiology",     department: "Heart & Vascular",  qualification: "MBBS, MD (Cardiology)",  experience: 12, consultationFee: 800,  workingHours: { start: "09:00", end: "17:00" }, slotDuration: 30, rating: 4.8 },
  { name: "Dr. Rajesh Kumar",   email: "rajesh@hospital.com",  specialty: "Orthopedics",    department: "Bone & Joint",      qualification: "MBBS, MS (Ortho)",       experience:  8, consultationFee: 600,  workingHours: { start: "10:00", end: "18:00" }, slotDuration: 30, rating: 4.7 },
  { name: "Dr. Priya Nair",     email: "priya@hospital.com",   specialty: "Pediatrics",     department: "Child Health",      qualification: "MBBS, MD (Pediatrics)",  experience: 10, consultationFee: 500,  workingHours: { start: "09:00", end: "15:00" }, slotDuration: 20, rating: 4.9 },
  { name: "Dr. Mohammed Arif",  email: "arif@hospital.com",    specialty: "Neurology",      department: "Brain & Spine",     qualification: "MBBS, DM (Neurology)",   experience: 15, consultationFee: 1000, workingHours: { start: "11:00", end: "17:00" }, slotDuration: 45, rating: 4.9 },
  { name: "Dr. Sunitha Menon",  email: "sunitha@hospital.com", specialty: "Gynecology",     department: "Women's Health",    qualification: "MBBS, MS (OBG)",         experience:  9, consultationFee: 700,  workingHours: { start: "09:00", end: "16:00" }, slotDuration: 30, rating: 4.8 },
  { name: "Dr. Vivek Iyer",     email: "vivek@hospital.com",   specialty: "Dermatology",    department: "Skin & Hair",       qualification: "MBBS, MD (Dermatology)", experience:  7, consultationFee: 600,  workingHours: { start: "10:00", end: "17:00" }, slotDuration: 20, rating: 4.6 },
];

export async function POST(request) {
  try {
    await connectDB();

    // Seed doctors (skip existing by email)
    let doctorsCreated = 0;
    for (const doc of DEMO_DOCTORS) {
      const exists = await Doctor.findOne({ email: doc.email });
      if (!exists) {
        await Doctor.create({ ...doc, isAvailable: true, isActive: true });
        doctorsCreated++;
      }
    }

    // Always upsert admin user so password is always correct
    // We delete and recreate so the pre-save bcrypt hook fires fresh
    await User.deleteOne({ email: "admin@hospital.com" });
    await User.create({
      name:     "Admin User",
      email:    "admin@hospital.com",
      password: "Admin@123",   // pre-save hook hashes this
      role:     "admin",
    });

    return NextResponse.json({
      success: true,
      message: `Seeded ${doctorsCreated} new doctors. Admin account reset → admin@hospital.com / Admin@123`,
    });
  } catch (err) {
    console.error("[Seed]", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Allow GET so you can hit it from the browser address bar during dev
export async function GET() {
  return NextResponse.json({
    message: "Send a POST request to this endpoint to seed demo data.",
    hint:    "curl -X POST http://localhost:3000/api/seed",
  });
}
