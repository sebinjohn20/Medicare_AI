import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    patientPhone: { type: String },
    doctorName: { type: String },
    specialty: { type: String },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // "09:00"
    type: {
      type: String,
      enum: ["in-person", "video", "phone"],
      default: "in-person",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reason: { type: String },
    notes: { type: String }, // doctor notes
    bookedVia: {
      type: String,
      enum: ["manual", "chatbot", "call", "admin"],
      default: "manual",
    },
    cancelledReason: { type: String },
    reminderSent: { type: Boolean, default: false },
    consultationFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Appointment =
  mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
