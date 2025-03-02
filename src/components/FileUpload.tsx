
import React, { useState, useRef } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  clientId?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB default
  clientId,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `The file exceeds the maximum size of ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const acceptedTypes = accept.split(",").map(type => 
      type.trim().replace(".", "").toLowerCase()
    );
    
    if (
      !acceptedTypes.includes(fileExtension) && 
      !acceptedTypes.some(type => fileType.includes(type.replace("*", "")))
    ) {
      toast({
        title: "Invalid file type",
        description: `Please upload a file with one of these extensions: ${accept}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        handleFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        handleFileUpload(file);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      await onFileUpload(file);
      // Reset the file input after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  return (
    <div className="w-full space-y-2">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200 ${
            dragActive 
              ? "border-black bg-slate-50" 
              : "border-slate-200 hover:border-slate-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleFileDrop}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <Upload className="h-8 w-8 mb-2 text-slate-400" />
            <h3 className="font-medium">Drag and drop your file</h3>
            <p className="text-sm text-slate-500">or click to browse from your computer</p>
            <p className="text-xs text-slate-400 mt-2">
              Max file size: {formatFileSize(maxSize)}
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleButtonClick} 
            className="mt-4"
            disabled={uploading}
          >
            Select File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <FileIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          {uploading ? (
            <div className="text-xs text-slate-500">Uploading...</div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="h-8 w-8 rounded-full hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
