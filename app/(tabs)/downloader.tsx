import { addDownload, getDownloads } from "@/utils/downloads";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

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

export default function Downloader() {
  const [downloads, setDownloads] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getDownloads();
      setDownloads(data);
    })();
  }, []);

  const handleSubmit = async () => {
    const id = getVideoId(videoUrl);

    const response = await axios.post("https://youtube-mp3-downloader-phi.vercel.app/api/youtube", { id });
    const { data } = response;
    setResult(data.response);
    addDownload(data.response);
  };
  console.log("result:", result);

  return (
    <View style={style.container}>
      {downloads.length > 0 && (
        <>
          {downloads.map((downloadItem: any, index) => (
            <View key={index}>
              <Text key={index}>{downloadItem.title}</Text>
              <Text key={index}>{downloadItem.link}</Text>
            </View>
          ))}
        </>
      )}

      <TextInput value={videoUrl} onChangeText={setVideoUrl} style={style.input} placeholder="Paste youtube url..." />
      <Button title="Download Video" onPress={handleSubmit} />
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
