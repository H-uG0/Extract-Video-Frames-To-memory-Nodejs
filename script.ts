import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ExtractFrames from "./ExtractFrames.ts";
import getVideoWH from "./vidMetadata.ts";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface VideoDimensions {
  width: number;
  height: number;
}

interface FrameData {
  [key: string]: any;
}

const readVideo = async (path: string): Promise<FrameData[]> => {
  const { width, height }: VideoDimensions = await getVideoWH(path);
  const HW: string = `${height}x${width}`;
  const logStream: fs.WriteStream = fs.createWriteStream("./logFile.log");

  const frames: FrameData[] = [];

  return new Promise<FrameData[]>((resolve, reject) => {
    const command = ffmpeg(path)
      .videoCodec("mjpeg")
      .size(HW)
      .format("rawvideo")
      .outputOptions("-f image2pipe")
      .on("error", (err: Error) => {
        reject(err);
      })
      .on("end", () => {
        resolve(frames);
      });

    // Pipe stderr to log file
    command.on("stderr", (stderrLine: string) => {
      logStream.write(stderrLine + "\n");
    });

    // Process frames
    const frameProcessor = new ExtractFrames("FFD8FF");
    frameProcessor.on("data", (data: FrameData) => {
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
