import { Player } from "@/components/Player";
import { SmallPlayer } from "@/components/SmallPlayer";
import { StyleSheet, View } from "react-native";

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <SmallPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
