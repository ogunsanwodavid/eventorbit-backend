import { Request } from "express";

import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

//Configure multer settings
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3, // Max 3 files
  },
});

//Upload event photos
const multerUploadEventPhotos = upload.fields([
  { name: "socialMediaPhoto", maxCount: 1 },
  { name: "eventCoverPhoto", maxCount: 1 },
  { name: "additionalPhotos", maxCount: 10 },
]);

export default multerUploadEventPhotos;
