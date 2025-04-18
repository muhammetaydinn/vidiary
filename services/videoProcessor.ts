import {
  FFmpegKit,
  FFmpegKitConfig,
  ReturnCode,
} from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { nanoid } from "nanoid/non-secure"; // Use non-secure import

// Define the interface for crop video parameters
export interface CropVideoParams {
  videoUri: string;
  startTime: number; // in seconds
  outputFileName?: string;
}

// Define the result interface
export interface ProcessedVideo {
  uri: string;
  thumbnailUri: string;
  duration: number; // Fixed duration of 5 seconds
}

let isInitialized = false;

// Check if FFmpegKit is available
const isFFmpegAvailable = () => {
  return FFmpegKit && typeof FFmpegKit.execute === "function";
};

// Initialize FFmpeg
export const initFFmpeg = async (): Promise<void> => {
  if (isInitialized) {
    console.log("FFmpeg already initialized");
    return;
  }

  try {
    if (!isFFmpegAvailable()) {
      console.warn(
        "FFmpegKit is not available. Video processing features will be disabled."
      );
      return;
    }

    // Create necessary directories first
    const videosDir = `${FileSystem.documentDirectory}videos/`;
    const thumbnailsDir = `${FileSystem.documentDirectory}thumbnails/`;

    await ensureDirectoryExists(videosDir);
    await ensureDirectoryExists(thumbnailsDir);

    // Initialize FFmpeg with minimal configuration
    await FFmpegKitConfig.enableLogCallback((_log: any) => {
      // You can handle logs here if needed
    });

    isInitialized = true;
    console.log("FFmpeg initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize FFmpeg:", error);
    // Don't throw here, just log the error
    // This allows the app to continue even if FFmpeg fails to initialize
  }
};

// Helper function to ensure a directory exists
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
  }
};

// Generate a thumbnail from a video
export const generateThumbnail = async (
  videoUri: string,
  time: number = 0
): Promise<string> => {
  try {
    if (!isInitialized || !isFFmpegAvailable()) {
      throw new Error("FFmpeg is not available. Please check initialization.");
    }

    const thumbnailId = nanoid();
    const thumbnailPath = `${FileSystem.documentDirectory}thumbnails/${thumbnailId}.jpg`;

    const command = `-ss ${time} -i "${videoUri}" -vframes 1 -q:v 2 "${thumbnailPath}"`;

    console.log("Starting thumbnail generation with command:", command);
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    const sessionLog = await session.getOutput();
    if (ReturnCode.isSuccess(returnCode)) {
      console.log("Thumbnail generated successfully.");
      return thumbnailPath;
    } else {
      console.error(
        `FFmpeg thumbnail generation failed with return code ${returnCode}.`
      );
      console.error("FFmpeg Log:", sessionLog);
      throw new Error(`Failed to generate thumbnail (code: ${returnCode})`);
    }
  } catch (error) {
    console.error("Error during thumbnail generation process:", error);
    throw error;
  }
};

// Crop a video to a specific segment
export const cropVideo = async ({
  videoUri,
  startTime,
  outputFileName,
}: CropVideoParams): Promise<ProcessedVideo> => {
  try {
    if (!isInitialized || !isFFmpegAvailable()) {
      throw new Error("FFmpeg is not available. Please check initialization.");
    }

    const videoId = outputFileName || nanoid();
    const outputPath = `${FileSystem.documentDirectory}videos/${videoId}.mp4`;

    const duration = 5; // Fixed duration

    const command = `-ss ${startTime} -i "${videoUri}" -t ${duration} -c:v mpeg4 -c:a aac -b:a 128k "${outputPath}"`;

    console.log("Starting video crop with command:", command);
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      const thumbnailUri = await generateThumbnail(outputPath, duration / 2);

      console.log("Video cropped successfully.");
      return {
        uri: outputPath,
        thumbnailUri,
        duration,
      };
    } else {
      console.error(`FFmpeg crop failed with return code ${returnCode}.`);
      const sessionLog = await session.getOutput();
      console.error("FFmpeg Log:", sessionLog);
      throw new Error(`Failed to crop video (code: ${returnCode})`);
    }
  } catch (error) {
    console.error("Error during cropping process:", error);
    throw error;
  }
};

// Get video information
export const getVideoInfo = async (
  videoUri: string
): Promise<{ duration: number }> => {
  try {
    if (!isInitialized || !isFFmpegAvailable()) {
      throw new Error("FFmpeg is not available. Please check initialization.");
    }

    const command = `-i "${videoUri}" -v quiet -print_format json -show_format -show_streams`;

    console.log("Getting video info with command:", command);
    const session = await FFmpegKit.execute(command);
    const output = await session.getOutput();

    const info = JSON.parse(output);
    const duration = parseFloat(info.format.duration);

    return { duration };
  } catch (error) {
    console.error("Error getting video info:", error);
    throw error;
  }
};
