import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ExtractFrames from "./lib/ExtractFrames.ts";
import GetVideoMetadata, { type VideoMetadata } from "./lib/vidMetadata.ts";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

type ExtractedVideoData = {
  frames: { timestamp: number; frame: Buffer }[];
  metadata: VideoMetadata;
};

const readVideo = async (path: string): Promise<ExtractedVideoData> => {
  const metadata = await GetVideoMetadata(path);
  const HW: string = `${metadata.height}x${metadata.width}`;
  const logStream: fs.WriteStream = fs.createWriteStream("./logFile.log");

  const frames: { timestamp: number; frame: Buffer }[] = [];

  return new Promise<ExtractedVideoData>((resolve, reject) => {
    const command = ffmpeg(path)
      .videoCodec("mjpeg")
      .size(HW)
      .format("rawvideo")
      .outputOptions("-f image2pipe")
      .on("error", (err: Error) => {
        reject(err);
      })
      .on("end", () => {
        resolve({
          frames,
          metadata,
        });
      });

    // Pipe stderr to log file
    command.on("stderr", (stderrLine: string) => {
      logStream.write(stderrLine + "\n");
    });

    // Process frames
    const frameProcessor = new ExtractFrames("FFD8FF", metadata.fps);
    frameProcessor.on("data", (data: { timestamp: number; frame: Buffer }) => {
      frames.push(data);
    });

    // Get the output stream and pipe to our processor
    const ffstream = command.pipe();
    ffstream.on("error", (err: Error) => {
      reject(err);
    });
    ffstream.pipe(frameProcessor);
  });
};

export default readVideo;
