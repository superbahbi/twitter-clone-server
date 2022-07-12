const Datauri = require("datauri");
const path = require("path");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let uploadToCloud = (req, next) => {
  const dUri = new Datauri();

  const dataUri = (req) =>
    dUri.format(
      path.extname(req.file.originalname).toString(),
      req.file.buffer
    );
  const file = dataUri(req).content;
  cloudinary.v2.uploader.upload(
    file,
    { folder: req.body.type },
    (error, result) => {
      if (error) {
        next(error);
      }
      next(result);
    }
  );
};

module.exports = {
  uploadToCloud: uploadToCloud,
};
