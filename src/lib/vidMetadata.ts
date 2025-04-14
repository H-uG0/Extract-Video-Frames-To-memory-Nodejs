import fluentFfmpeg from "fluent-ffmpeg";

export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
}

const GetVideoMetadata = async (path: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    fluentFfmpeg.ffprobe(
      path,
      (err: Error | null, data: fluentFfmpeg.FfprobeData) => {
        if (err) {
          reject(err);
          return;
        }

        // Find the first video stream with dimensions
        const videoStream = data.streams.find(
          (stream) =>
            stream.codec_type === "video" && stream.width && stream.height
        );

        if (!videoStream?.width || !videoStream?.height) {
          reject(new Error("Could not determine video dimensions"));
          return;
        }

        const metadata: VideoMetadata = {
          width: videoStream.width,
          height: videoStream.height,
          fps: videoStream.r_frame_rate
            ? parseFloat(videoStream.r_frame_rate)
            : 0,
          duration: data.format.duration,
          bitrate: data.format.bit_rate,
          codec: videoStream.codec_name,
        };

        resolve(metadata);
      }
    );
  });
};

export default GetVideoMetadata;
