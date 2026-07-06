import multer from "multer";
import { processAndStoreImage } from "../utils/imageStorage.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

export function uploadFabricImageMiddleware(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).send({ message: "Image must be 5MB or smaller" });
      return;
    }

    res.status(400).send({ message: err.message || "Invalid image upload" });
  });
}

export function processFabricImage(file) {
  return processAndStoreImage(file, {
    folder: "fabrics",
    filenamePrefix: "fabric",
    resize: {
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    },
  });
}
