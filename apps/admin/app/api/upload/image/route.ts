/**
 * Image Upload Route
 * Handles image uploads to Supabase Storage
 */

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";

import { requireStaff } from "@/lib/auth/server";
export async function POST(request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("content-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("content-images").getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: data.path,
    });
  } catch (error: unknown) {
    logError(error, "ImageUpload");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      {
        error: getUserFriendlyMessage(errorInfo as any),
        code: errorInfo.code,
      },
      { status: errorInfo.statusCode }
    );
  }
}

