import multer from "multer";

//Configure Multer middleware
//::Accept only jpeg, png and webp images
//::Restrict file size to 5MB
const multerUploadCoverPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    cb(null, validTypes.includes(file.mimetype));
  },
}).single("coverPhoto");

export default multerUploadCoverPhoto;
