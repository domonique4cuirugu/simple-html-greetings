
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const clientId = formData.get('clientId');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Sanitize file name and prepare file path
    const sanitizedFileName = (file as File).name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = sanitizedFileName.split('.').pop() || '';
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('client-files')
      .upload(filePath, file, {
        contentType: (file as File).type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Add file metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('client_files')
      .insert({
        name: sanitizedFileName,
        type: (file as File).type,
        size: (file as File).size,
        uploaded_by: "AccountantName", // This should be replaced with the actual user name
        client_id: clientId || null,
        storage_path: filePath
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'File uploaded successfully',
        file: {
          id: dbData.id,
          name: dbData.name,
          type: dbData.type,
          size: dbData.size,
          uploadedAt: dbData.uploaded_at,
          uploadedBy: dbData.uploaded_by,
          clientId: dbData.client_id,
          storagePath: dbData.storage_path
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
