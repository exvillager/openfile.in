import { useState } from "react";
import { Image, Modal, StatusBar, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  uri: string;
}

export default function ImagePreview({ uri }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setFullscreen(true)} activeOpacity={0.85}>
        <Image source={{ uri }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
      </TouchableOpacity>
      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <StatusBar hidden />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFullscreen(false)}
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          <TouchableOpacity
            onPress={() => setFullscreen(false)}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              padding: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 20,
            }}
          >
            <AntDesign name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
