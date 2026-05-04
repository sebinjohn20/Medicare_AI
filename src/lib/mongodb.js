import mongoose from "mongoose";

// Cache connection across hot-reloads in development
let cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your .env.local file."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands:             false,
        maxPoolSize:                10,
        serverSelectionTimeoutMS:   10_000,
        socketTimeoutMS:            45_000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next call
    throw err;
  }

  return cached.conn;
}
