router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const fileUrl = req.file.path; // Cloudinary URL

    // You can save this URL in DB if needed
    res.status(200).json({
      status: 'success',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});
