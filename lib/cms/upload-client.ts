const UPLOAD_API = "/api/upload";
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return "File too large (max 5MB).";
  }
  return null;
}

export async function uploadImageToR2(
  file: File,
  token: string
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const presignRes = await fetch(UPLOAD_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  const presignData: unknown = await presignRes.json();
  if (!presignRes.ok) {
    const msg =
      typeof presignData === "object" &&
      presignData !== null &&
      "error" in presignData &&
      typeof (presignData as { error: unknown }).error === "string"
        ? (presignData as { error: string }).error
        : "Failed to get upload URL";
    throw new Error(msg);
  }

  const { uploadUrl, publicUrl } = presignData as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`R2 upload failed (${putRes.status})`);
  }

  return publicUrl;
}
