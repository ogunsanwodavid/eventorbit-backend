import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

import { Readable } from "stream";

//Validate environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary configuration!");
}

//Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Upload stream
export const uploadStream = (
  buffer: Buffer,
  folder: string,
  options: Record<string, any> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: "auto",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

//Upload base64 images
export const uploadBase64 = (
  base64: string,
  folder: string,
  options: Record<string, any> = {}
): Promise<string> => {
  //Remove data: prefix if present
  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:application/octet-stream;base64,${cleanBase64}`,
      {
        folder,
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result.secure_url);
        else reject(new Error("Cloudinary upload failed"));
      }
    );
  });
};

export const deleteResources = (public_ids: string[]) => {
  return cloudinary.api.delete_resources(public_ids);
};
