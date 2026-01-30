"use server";

import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function uploadChannelImage(formData: FormData, type: 'avatar' | 'banner') {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Not authenticated" };

  const endpoint = `/users/upload/${type}`;
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Upload failed: ${errorMessage}`);
    }

    const data = await response.json();
    
    revalidatePath("/studio/customization");
    revalidatePath("/channels/me");
    revalidatePath("/studio");
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error(`Upload ${type} failed:`, error);
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}
