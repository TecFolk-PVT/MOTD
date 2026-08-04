import mongoose from "mongoose";

const CustomerSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    measurementUnit: {
      type: String,
      enum: ["meters", "wara"],
      default: "meters",
    },
  },
  {
    timestamps: true,
  },
);

const CustomerSettings = mongoose.model(
  "CustomerSettings",
  CustomerSettingSchema,
);
export default CustomerSettings;
