// middleware/uploadCustomerImage.js
import multer from "multer";
import { processAndStoreImage } from "../utils/imageStorage.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

export function uploadCustomerImageMiddleware(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Image must be 5MB or smaller" });
      return;
    }

    res.status(400).json({ message: err.message || "Invalid image upload" });
  });
}

export function processCustomerImage(file) {
  return processAndStoreImage(file, {
    folder: "customer",
    filenamePrefix: "customer",
    resize: {
      width: 400,
      height: 400,
      fit: "cover",
      withoutEnlargement: true,
    },
    webpQuality: 85,
  });
}
