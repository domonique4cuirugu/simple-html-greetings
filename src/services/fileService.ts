
import { supabase } from "@/integrations/supabase/client";

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

export type ClientFileGroup = {
  clientId: string;
  clientName: string;
  files: FileItem[];
};

export const fileService = {
  /**
   * Get all files
   */
  async getAllFiles(): Promise<FileItem[]> {
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('*, clients(name)')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        throw error;
      }

      return data.map(file => ({
        id: file.id,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date(file.uploaded_at),
        uploadedBy: file.uploaded_by,
        clientId: file.client_id,
        storagePath: file.storage_path
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  },

  /**
   * Get files grouped by client
   */
  async getFilesByClient(): Promise<ClientFileGroup[]> {
    try {
      // First get all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name');

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }

      // Then get all files
      const { data: files, error: filesError } = await supabase
        .from('client_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filesError) {
        console.error("Error fetching files:", filesError);
        throw filesError;
      }

      // Group files by client
      return clients.map(client => {
        const clientFiles = files
          .filter(file => file.client_id === client.id)
          .map(file => ({
            id: file.id,
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            uploadedAt: new Date(file.uploaded_at),
            uploadedBy: file.uploaded_by,
            clientId: file.client_id,
            storagePath: file.storage_path
          }));

        return {
          clientId: client.id,
          clientName: client.name,
          files: clientFiles
        };
      });
    } catch (error) {
      console.error("Error fetching files by client:", error);
      return [];
    }
  },

  /**
   * Upload a file
   */
  async uploadFile(file: File, clientId?: string): Promise<FileItem | null> {
    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop() || '';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('client-files')
        .getPublicUrl(filePath);
        
      // Store file metadata in the database
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploaded_by: "AccountantName", // This should be replaced with actual user name
        client_id: clientId || null,
        storage_path: filePath // Add the storage path to the database
      };
      
      const { data, error } = await supabase
        .from('client_files')
        .insert(fileData)
        .select()
        .single();
        
      if (error) {
        console.error("Error saving file metadata:", error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        type: getFileType(data.name),
        size: data.size,
        uploadedAt: new Date(data.uploaded_at),
        uploadedBy: data.uploaded_by,
        clientId: data.client_id,
        storagePath: data.storage_path
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // First get the file to get its storage path
      const { data: file, error: fetchError } = await supabase
        .from('client_files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching file to delete:", fetchError);
        throw fetchError;
      }
      
      // Delete from Supabase Storage (if we have a file path)
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('client-files')
          .remove([file.storage_path]);
          
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue anyway to delete the database entry
        }
      }
      
      // Delete metadata from database
      const { error } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId);
        
      if (error) {
        console.error("Error deleting file metadata:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
};

/**
 * Helper function to determine file type from filename
 */
export const getFileType = (fileName: string): FileItem["type"] => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(extension)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
  return 'other';
};
