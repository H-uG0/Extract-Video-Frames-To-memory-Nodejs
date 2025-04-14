# Extract-Video-Frames-To-memory-Nodejs

A function to read a video as an array of buffer ( one buffer per frame )

## Installation

    npm i extract-video-frames-ts

## Usage

    import readVideo from "extract-video-frames-ts"
    readVideo('./video.mp4').then((data)=>console.log(data.length))
