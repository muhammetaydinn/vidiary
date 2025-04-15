import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { nanoid } from 'nanoid/non-secure'; // Use non-secure import

// Define the interface for crop video parameters
export interface CropVideoParams {
  videoUri: string;
  startTime: number; // in seconds
  duration: number; // in seconds (default 5)
  outputFileName?: string;
}

// Define the result interface
export interface ProcessedVideo {
  uri: string;
  thumbnailUri: string;
  duration: number;
}

// Initialize FFmpeg
export const initFFmpeg = async (): Promise<void> => {
  try {
    // Set log level
    await FFmpegKitConfig.enableLogCallback((_log: any) => {
      // You can handle logs here if needed
    });
    
    // Create necessary directories
    const videosDir = `${FileSystem.documentDirectory}videos/`;
    const thumbnailsDir = `${FileSystem.documentDirectory}thumbnails/`;
    
    await ensureDirectoryExists(videosDir);
    await ensureDirectoryExists(thumbnailsDir);
  } catch (error) {
    console.error('Failed to initialize FFmpeg:', error);
    throw error;
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
    // await FFmpegKit.cancel(); // Removed cancel call
    const thumbnailId = nanoid();
    const thumbnailPath = `${FileSystem.documentDirectory}thumbnails/${thumbnailId}.jpg`;

    // Use FFmpeg to extract a frame at the specified time
    const command = `-ss ${time} -i "${videoUri}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
    
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    
    if (ReturnCode.isSuccess(returnCode)) {
      return thumbnailPath;
    } else {
      throw new Error('Failed to generate thumbnail');
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

// Crop a video to a specific segment
export const cropVideo = async ({
  videoUri,
  startTime,
  duration = 5,
  outputFileName,
}: CropVideoParams): Promise<ProcessedVideo> => {
  try {
    // await FFmpegKit.cancel(); // Removed cancel call
    const videoId = outputFileName || nanoid();
    const outputPath = `${FileSystem.documentDirectory}videos/${videoId}.mp4`;

    // Construct the FFmpeg command for cropping
    const command = `-ss ${startTime} -i "${videoUri}" -t ${duration} -c:v libx264 -c:a aac -strict experimental -b:a 128k "${outputPath}"`;
    
    // Execute the command
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    
    if (ReturnCode.isSuccess(returnCode)) {
      // Generate a thumbnail from the middle of the cropped video
      const thumbnailUri = await generateThumbnail(outputPath, duration / 2);
      
      return {
        uri: outputPath,
        thumbnailUri,
        duration,
      };
    } else {
      throw new Error('Failed to crop video');
    }
  } catch (error) {
    console.error('Error cropping video:', error);
    throw error;
  }
};

// Get video information (duration, resolution, etc.)
export const getVideoInfo = async (videoUri: string): Promise<{ duration: number }> => {
  try {
    // await FFmpegKit.cancel(); // Removed cancel call
    // Use FFmpeg to get video information
    const command = `-i "${videoUri}" -v quiet -print_format json -show_format -show_streams`;

    const session = await FFmpegKit.execute(command);
    const output = await session.getOutput();
    
    // Parse the JSON output
    const info = JSON.parse(output);
    const duration = parseFloat(info.format.duration);
    
    return { duration };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
};
