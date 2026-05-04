import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromName: { type: String },
    fromEmail: { type: String },
    channel: {
      type: String,
      enum: ["email", "whatsapp", "chat", "system"],
      default: "chat",
    },
    subject: { type: String },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export default Message;
