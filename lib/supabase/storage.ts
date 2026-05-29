import { getSupabase } from "./client";

const BUCKET = "incident-photos";

export async function uploadIncidentImage(
  file: File,
  userId: string
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;

  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
