import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ImagePreviewModal = ({ images, index, onClose }) => {
  if (!images || images.length === 0) return null;

  const slides = images.map((url) => ({ src: url }));

  return (
    <Lightbox
      open={index !== null}
      close={onClose}
      index={index}
      slides={slides}
    />
  );
};

export default ImagePreviewModal;
