import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, Filter, FolderPlus } from "lucide-react";
import FileList, { FileItem } from "@/components/FileList";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { fileService, ClientFileGroup, getFileType } from "@/services/fileService";
import { supabase } from "@/integrations/supabase/client";

const Files = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [clientFiles, setClientFiles] = useState<ClientFileGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const files = await fileService.getAllFiles();
      setAllFiles(files);

      const filesByClient = await fileService.getFilesByClient();
      setClientFiles(filesByClient);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAllFiles = allFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClientFiles = clientFiles.map((group) => ({
    ...group,
    files: group.files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-file`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }
      
      const newFile: FileItem = {
        id: result.file.id,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: "AccountantName",
      };
      
      setAllFiles([newFile, ...allFiles]);
      
      fetchFiles();
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="max-w-6xl mx-auto slide-up">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Files</h1>
              <p className="text-slate-500 mt-1">
                Manage and share files with your clients
              </p>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-black hover:bg-slate-800">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card className="shadow-soft">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="bg-slate-100 p-0.5">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm"
                >
                  All Files
                </TabsTrigger>
                <TabsTrigger 
                  value="by-client" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm"
                >
                  By Client
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm"
                >
                  Upload
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading files...</p>
                </div>
              ) : (
                <FileList 
                  files={filteredAllFiles} 
                  emptyMessage={
                    searchQuery 
                      ? `No files matching "${searchQuery}"` 
                      : "No files available"
                  } 
                />
              )}
            </TabsContent>

            <TabsContent value="by-client" className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading files...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredClientFiles.map((group) => (
                    group.files.length > 0 && (
                      <div key={group.clientId} className="space-y-2">
                        <h3 className="font-medium text-lg">{group.clientName}</h3>
                        <FileList 
                          files={group.files} 
                          emptyMessage={`No files for ${group.clientName}`} 
                        />
                      </div>
                    )
                  ))}

                  {filteredClientFiles.every((group) => group.files.length === 0) && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? `No client files matching "${searchQuery}"` 
                          : "No client files available"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="p-6">
              <div className="max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Upload New File</h2>
                <p className="text-slate-500 mb-6">
                  Select a file from your computer to upload. You can upload documents, images, spreadsheets, and more.
                </p>
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Files;
