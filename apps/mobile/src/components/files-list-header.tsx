import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "@/src/constant";

interface Props {
  hasKey: boolean;
  showKeyInput: boolean;
  keyInputValue: string;
  isError: boolean;
  errorMessage?: string;
  onKeyInputChange: (value: string) => void;
  onSetKeyIv: () => void;
  onCancelKeyInput: () => void;
}

export default function FilesListHeader({
  hasKey,
  showKeyInput,
  keyInputValue,
  isError,
  errorMessage,
  onKeyInputChange,
  onSetKeyIv,
  onCancelKeyInput,
}: Props) {
  return (
    <View>
      {!hasKey && (
        <View
          className="flex-row items-start bg-yellow-950/40 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4"
          style={{ gap: 8 }}
        >
          <AntDesign name="warning" size={14} color={COLORS.warning} />
          <Text className="text-yellow-300/80 text-sm flex-1">
            No key found. Use &quot;Add Key/IV&quot; to paste your backup key.
          </Text>
        </View>
      )}

      {showKeyInput && (
        <View className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
          <Text className="text-zinc-300 text-sm font-medium mb-2">
            Paste backup JSON {`{"key":"...","iv":"..."}`}
          </Text>
          <TextInput
            value={keyInputValue}
            onChangeText={onKeyInputChange}
            placeholder={`{"key":"...","iv":"..."}`}
            placeholderTextColor={COLORS.placeholder}
            multiline
            numberOfLines={3}
            className="bg-zinc-800 text-zinc-100 text-xs p-3 rounded-lg border border-zinc-700 font-mono"
            style={{ textAlignVertical: "top", minHeight: 72 }}
            autoFocus
          />
          <View className="flex-row mt-3" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={onSetKeyIv}
              className="flex-1 bg-indigo-600 py-2 rounded-lg items-center"
            >
              <Text className="text-white text-sm font-semibold">Set Key/IV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancelKeyInput}
              className="px-4 py-2 bg-zinc-800 rounded-lg items-center"
            >
              <Text className="text-zinc-400 text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isError && <Text className="text-red-400 text-sm mb-4">{errorMessage}</Text>}
    </View>
  );
}
