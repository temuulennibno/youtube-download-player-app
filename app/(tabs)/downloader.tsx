import { addDownload, getDownloads } from "@/utils/downloads";
import axios from "axios";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as FileSystem from "expo-file-system";

const getVideoId = (videoUrl: string) => {
  try {
    const ValidUrl = new URL(videoUrl);
    const regex = /[?&]v=([^#&\?]+)/;
    const match = videoUrl.match(regex);

    return match ? match[1] : null;
  } catch (error) {
    return "";
  }
};

const getFormattedDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds}`;
};

const getFormattedFileSize = (size: number) => {
  const mbs = size / (1024 * 1024);
  return `${mbs.toFixed(2)} MB`;
};

export default function Downloader() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleConvert = async () => {
    const id = getVideoId(videoUrl);

    const response = await axios.post("https://youtube-mp3-downloader-phi.vercel.app/api/youtube", { id });
    const { data } = response;
    setResult(data.response);
  };

  const handleDownload = async () => {
    const { link, title } = result;
    const path = FileSystem.documentDirectory + `/${encodeURI(title)}.mp3`;
    const downloadResumable = FileSystem.createDownloadResumable(link, path, {}, (downloadProgress) => {
      const progress = Number((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100).toFixed(1);
      setProgress(Number(progress));
    });

    if (downloadResumable.savable()) {
      setIsDownloading(true);
      const downloadedFile = await downloadResumable.downloadAsync().finally(() => {
        setIsDownloading(false);
        setIsDownloaded(true);
      });
      if (downloadedFile) {
        const uri = downloadedFile.uri;
        await addDownload({ title, uri });
      }
    }
  };

  return (
    <View style={style.container}>
      {result && (
        <>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Title: {result.title}</Text>
            <Text>Duration: {getFormattedDuration(result.duration)}</Text>
            <Text>Size: {getFormattedFileSize(result.filesize)}</Text>
            {isDownloaded && <Text>Downloaded</Text>}
            {isDownloading && <Text>Downloading {progress}%</Text>}
            {!isDownloaded && !isDownloading && <Button title="Download" onPress={handleDownload} />}
          </View>
        </>
      )}

      <TextInput value={videoUrl} onChangeText={setVideoUrl} style={style.input} placeholder="Paste youtube url..." />
      <Button title="Convert Video" onPress={handleConvert} />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  input: {
    padding: 20,
    height: 60,
    margin: 12,
    borderWidth: 1,
  },
});
