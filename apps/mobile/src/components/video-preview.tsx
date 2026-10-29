import { useVideoPlayer, VideoView } from "expo-video";

interface Props {
  localUri: string;
}

export default function VideoPreview({ localUri }: Props) {
  const player = useVideoPlayer(localUri, (p) => {
    p.loop = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: 200 }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
