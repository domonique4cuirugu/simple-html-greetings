
import React from "react";
import { File, Download, FileText, Image, FileArchive, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type FileItem = {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "spreadsheet" | "archive" | "other";
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  clientId?: string;
  storagePath?: string;
};

interface FileListProps {
  files: FileItem[];
  emptyMessage?: string;
}

const getFileIcon = (type: FileItem["type"]) => {
  switch (type) {
    case "pdf":
      return <FileText className="text-red-500" />;
    case "image":
      return <Image className="text-blue-500" />;
    case "document":
      return <File className="text-blue-700" />;
    case "spreadsheet":
      return <FileText className="text-green-600" />;
    case "archive":
      return <FileArchive className="text-yellow-600" />;
    default:
      return <File className="text-gray-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  else return (bytes / 1073741824).toFixed(1) + " GB";
};

const FileList: React.FC<FileListProps> = ({ files, emptyMessage = "No files available" }) => {
  const { toast } = useToast();

  const handleDownload = async (file: FileItem) => {
    try {
      if (!file.storagePath) {
        // If we don't have a storage path, try to get the file from the database
        const { data: fileData, error } = await supabase
          .from('client_files')
          .select('storage_path')
          .eq('id', file.id)
          .single();
          
        if (error || !fileData?.storage_path) {
          throw new Error("Could not find file storage path");
        }
        
        file.storagePath = fileData.storage_path;
      }
      
      // Get file URL from storage
      const { data, error } = await supabase.storage
        .from('client-files')
        .createSignedUrl(file.storagePath, 60); // 60 seconds expiry
        
      if (error || !data?.signedUrl) {
        throw new Error("Could not generate download link");
      }
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `${file.name} is being downloaded`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not download file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2 slide-up">
      {files.length > 0 ? (
        <div className="bg-white rounded-lg border divide-y">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{file.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDistanceToNow(file.uploadedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-slate-100"
                onClick={() => handleDownload(file)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileList;
