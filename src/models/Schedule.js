import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDuration: { type: Number, default: 30 },
    isHoliday: { type: Boolean, default: false },
    isEmergencyLeave: { type: Boolean, default: false },
    leaveReason: { type: String },
    bookedSlots: [{ type: String }], // ["09:00", "09:30"]
    maxPatients: { type: Number, default: 16 },
    status: {
      type: String,
      enum: ["active", "cancelled", "holiday"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);
export default Schedule;
