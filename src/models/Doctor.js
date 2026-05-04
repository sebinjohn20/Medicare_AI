import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    specialty: { type: String, required: true },
    department: { type: String },
    qualification: { type: String },
    experience: { type: Number, default: 0 }, // years
    avatar: { type: String },
    bio: { type: String },
    consultationFee: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    // Default working hours
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    workingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    slotDuration: { type: Number, default: 30 }, // minutes
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalPatients: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;
