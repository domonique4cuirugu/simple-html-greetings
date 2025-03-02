
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "No client ID provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize filename to remove non-ASCII characters
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, "");
    const fileExt = sanitizedFileName.split(".").pop();

    // Generate a unique file path
    const filePath = `${clientId}/${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("client-files")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "Failed to upload file", details: uploadError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get file type for database
    const getFileType = (fileName: string): string => {
      const extension = fileName.split(".").pop()?.toLowerCase() || "";
      if (["pdf"].includes(extension)) return "pdf";
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
      if (["doc", "docx", "txt", "rtf"].includes(extension)) return "document";
      if (["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
      if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return "archive";
      return "other";
    };

    // Add file metadata to database
    const { error: dbError } = await supabase
      .from("client_files")
      .insert([{
        client_id: clientId,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploaded_by: "You",
      }]);

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Failed to save file metadata", details: dbError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "File uploaded successfully", 
        filePath,
        fileName: file.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
