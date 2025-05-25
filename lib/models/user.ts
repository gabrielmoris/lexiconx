// very probably I wont need this
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema({
  user: { type: UserSchema, required: true },
  expires: { type: Date, required: true },
});

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
