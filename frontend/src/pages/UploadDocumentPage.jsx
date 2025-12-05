import React, { useState, useCallback, useRef, useEffect } from "react";
import Navigation from "../components/Navigation";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

// --- Footer Component ---
const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-6 mt-12">
    <div className="container mx-auto text-center text-sm text-gray-500">
      &copy; 2025 SARTHI National Portal, all rights reserved
    </div>
  </footer>
);

// --- FilePreview Component ---
function FilePreview({ file, onRemove }) {
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    if (file.type && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setImageURL(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const getFileIcon = (fileType) =>
    fileType.startsWith("image/") ? "fa-file-image" : "fa-file-alt";

  const formatFileSize = (bytes) =>
    bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} Bytes`;

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-sm overflow-hidden">
          {imageURL ? (
            <img
              src={imageURL}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <i
              className={`fas ${getFileIcon(file.type)} text-2xl`}
              style={{ color: DEEP_INDIGO }}
            ></i>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
          <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        onClick={() => onRemove(file.name)}
        className="text-gray-500 hover:text-red-500 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

// --- Main UploadDocumentPage Component ---
function UploadDocumentPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const newFiles = Array.from(fileList).reduce((acc, file) => {
        if (!files[file.name]) {
          acc[file.name] = file;
        }
        return acc;
      }, {});
      setFiles((prev) => ({ ...prev, ...newFiles }));
    },
    [files]
  );

  const handleRemoveFile = useCallback((fileName) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileName];
      return newFiles;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    console.log("Submitting the following files:", Object.values(files));
    setToastMessage("Your documents have been submitted successfully!");
    setFiles({});
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, [files]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const dropAreaClasses = `border-2 border-dashed rounded-lg p-8 text-center transition-all ${
    isDragOver
      ? "border-indigo-500 bg-indigo-100"
      : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
  }`;

  const totalFiles = Object.keys(files).length;

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* Reusable navbar from ../components/Navigation */}
      <Navigation currentPage="My Dashboard" />

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-10 flex-grow w-full">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10">
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-extrabold"
              style={{ color: DEEP_INDIGO }}
            >
              Upload Your Documents
            </h2>
            <p className="mt-2 text-gray-500">
              Drag & drop files here or click to browse.
            </p>
          </div>

          <div
            className={dropAreaClasses}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              multiple
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <i className="fas fa-cloud-upload-alt text-5xl text-gray-400"></i>
              <p className="text-gray-600">Drag & drop your files here</p>
              <p className="text-sm text-gray-400">or</p>
              <button
                onClick={() => fileInputRef.current.click()}
                className="text-white font-semibold px-6 py-2 rounded-md shadow-sm transition-colors"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                Browse Files
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {Object.values(files).map((file) => (
              <FilePreview
                key={file.name}
                file={file}
                onRemove={handleRemoveFile}
              />
            ))}
          </div>

          {totalFiles > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="w-full text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-colors duration-200"
                style={{ backgroundColor: DEEP_INDIGO }}
              >
                Submit All Documents ({totalFiles})
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {toastMessage && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-lg shadow-2xl"
          role="alert"
        >
          <i className="fas fa-check-circle text-green-400 mr-3 text-lg"></i>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default UploadDocumentPage;
