import { useState } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type { FileItem } from "@/src/api/links-api";
import { decryptAndSave, decryptToBase64, decryptToLocalUri } from "@/src/utils/crypto";
import { formatBytes, getFileExt, getExtStyle, isImage, isVideo } from "@/src/utils/file-utils";
import ImagePreview from "./image-preview";
import VideoPreview from "./video-preview";
import FileCardActions from "./file-card-actions";
import { AntDesign } from "@expo/vector-icons";
import { useDeleteFile } from "../api/api";

interface Props {
  file: FileItem;
  token: string;
  linkId: string;
  encryptionKey: string;
  iv: string;
}

export default function FileCard({ file, token, linkId, encryptionKey, iv }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFile();

  const ext = getFileExt(file.name);
  const hasKey = !!encryptionKey && !!iv;
  const canPreview = isImage(ext) || isVideo(ext);

  async function handleTogglePreview() {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (!hasKey) {
      Alert.alert("No Key/IV", "Add your backup Key/IV to preview this file.");
      return;
    }
    if (imageUri || videoUri) {
      setShowPreview(true);
      return;
    }
    setIsProcessing(true);
    try {
      if (isImage(ext)) {
        setImageUri(await decryptToBase64(file.url, file.id, token, file.name, encryptionKey, iv));
      } else {
        setVideoUri(
          await decryptToLocalUri(file.url, file.id, token, file.name, encryptionKey, iv),
        );
      }
      setShowPreview(true);
    } catch (e) {
      Alert.alert(
        "Error",
        "Failed to decrypt file. " + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownload() {
    if (!hasKey) {
      Alert.alert("No Key/IV", "Add your backup Key/IV to download this file.");
      return;
    }
    setIsProcessing(true);
    try {
      await decryptAndSave(file.url, file.id, token, file.name, encryptionKey, iv);
    } catch (e) {
      Alert.alert("Download Error", e instanceof Error ? e.message : String(e));
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Delete file",
      `Are you sure you want to delete "${file.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFile({ link_id: linkId, file_id: file.id });
              queryClient.invalidateQueries({ queryKey: ["files", linkId, token] });
            } catch (e) {
              Alert.alert("Delete Error", e instanceof Error ? e.message : String(e));
            }
          },
        },
      ],
    );
  }

  return (
    <View className="bg-zinc-900 rounded-xl overflow-hidden">
      {showPreview && imageUri && <ImagePreview uri={imageUri} />}
      {showPreview && videoUri && <VideoPreview localUri={videoUri} />}

      <View className="p-4" style={{ gap: 12 }}>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View className={`w-10 h-10 rounded-xl items-center justify-center ${getExtStyle(ext)}`}>
            <Text className="text-white text-[9px] font-bold">{ext}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-zinc-100 font-medium text-sm" numberOfLines={1}>
              {file.name}
            </Text>
            <Text className="text-zinc-500 text-xs mt-0.5">{formatBytes(file.size)}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} disabled={isDeleting} hitSlop={8}>
            {isDeleting ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <AntDesign name="delete" size={16} color={"red"} />
            )}
          </TouchableOpacity>
        </View>

        <FileCardActions
          canPreview={canPreview}
          showPreview={showPreview}
          isProcessing={isProcessing}
          onTogglePreview={handleTogglePreview}
          onDownload={handleDownload}
        />
      </View>
    </View>
  );
}
