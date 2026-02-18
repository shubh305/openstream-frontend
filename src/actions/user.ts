"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function uploadChannelImage(formData: FormData, type: "avatar" | "banner") {
  try {
    const data = await api.post<{ url: string }>(`/users/upload/${type}`, formData);

    revalidatePath("/studio/customization");
    revalidatePath("/channels/me");
    revalidatePath("/studio");

    return { success: true, url: data.url };
  } catch (error) {
    console.error(`Upload ${type} failed:`, error);
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}
