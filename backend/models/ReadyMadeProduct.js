import mongoose from "mongoose";

const readyMadeProductSchema = new mongoose.Schema(
  {
    // Product Name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional Product Code
    code: {
      type: String,
      trim: true,
      default: "",
    },

     // Slug – URL‑friendly identifier (unique)
    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    // Description
    description: {
      type: String,
      default: "",
      trim: true,
    },
    descriptionAr: {
      type: String,
      default: "",
      trim: true,
    },

    // Tags
    tag: {
      type: String,
      default: "",
      trim: true,
    },
    tagAr: {
      type: String,
      default: "",
      trim: true,
    },

    // Colors (multiple selected colors)
    colors: {
      type: [String],
      default: [],
      required: true,
    },

    // Images
    thumbnailImage: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    // Fabric Type
    fabricType: {
      type: String,
      required: true,
      trim: true,
    },

    fabricTypeAr: {
      type: String,
      required: true,
      trim: true,
    },

    // Tailor Name
    tailorName: {
      type: String,
      trim: true,
    },

    tailorNameAr: {
      type: String,
      trim: true,
    },

    // Fabric Details
    metersPerFabric: {
      type: Number,
      required: true,
      min: 0,
    },

    fabricPriceAED: {
      type: Number,
      min: 0,
    },

    mukhawarPriceAED: {
      type: Number,
      min: 0,
    },

    finalSellingPriceAED: {
      type: Number,
      required: true,
      min: 0,
    },

    // Stock
    availableFabricStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Useful indexes
readyMadeProductSchema.index({ isActive: 1 });
readyMadeProductSchema.index({ code: 1 });

// Pre‑save hook to auto‑generate slug if missing
readyMadeProductSchema.pre("save", function (next) {
  if (!this.slug) {
    const base = this.name || this.nameAr || "ready-made";
    this.slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const ReadyMadeProduct = mongoose.model(
  "ReadyMadeProduct",
  readyMadeProductSchema,
);

export default ReadyMadeProduct;
