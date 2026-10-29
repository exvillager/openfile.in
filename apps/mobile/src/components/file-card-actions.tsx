import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "@/src/constant";

interface Props {
  canPreview: boolean;
  showPreview: boolean;
  isProcessing: boolean;
  onTogglePreview: () => void;
  onDownload: () => void;
}

export default function FileCardActions({
  canPreview,
  showPreview,
  isProcessing,
  onTogglePreview,
  onDownload,
}: Props) {
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {canPreview && (
        <TouchableOpacity
          onPress={onTogglePreview}
          disabled={isProcessing}
          className="flex-1 flex-row items-center justify-center py-2 rounded-lg bg-zinc-800 border border-zinc-700"
          style={{ gap: 6 }}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.iconSubtle} />
          ) : (
            <>
              <AntDesign
                name={showPreview ? "eye-invisible" : "eye"}
                size={13}
                color={COLORS.iconSubtle}
              />
              <Text className="text-zinc-400 text-xs">{showPreview ? "Hide" : "Preview"}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onDownload}
        disabled={isProcessing}
        className="flex-1 flex-row items-center justify-center py-2 rounded-lg bg-indigo-600 border border-indigo-500/30"
        style={{ gap: 6 }}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <AntDesign name="download" size={13} color="#fff" />
            <Text className="text-white text-xs font-semibold">Download</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
