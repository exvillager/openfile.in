import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "@/src/constant";

interface Props {
  linkCount: number;
  storageUsed: string;
  search: string;
  onSearchChange: (value: string) => void;
  isError: boolean;
}

export default function LinksListHeader({
  linkCount,
  storageUsed,
  search,
  onSearchChange,
  isError,
}: Props) {
  return (
    <View>
      <Text className="text-2xl font-bold text-zinc-100 mt-6 mb-1">My Links</Text>

      <View className="flex-row mb-5" style={{ gap: 12 }}>
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-400 text-xs mb-1">Total Links</Text>
          <Text className="text-zinc-100 text-xl font-bold">{linkCount}</Text>
        </View>
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-400 text-xs mb-1">Storage Used</Text>
          <Text className="text-zinc-100 text-xl font-bold">{storageUsed}</Text>
        </View>
      </View>

      <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 mb-5" style={{ gap: 8 }}>
        <AntDesign name="search" size={16} color={COLORS.icon} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search links by name…"
          placeholderTextColor={COLORS.placeholder}
          className="flex-1 py-3 text-zinc-100 text-sm"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <AntDesign name="close" size={14} color={COLORS.icon} />
          </TouchableOpacity>
        )}
      </View>

      {isError && (
        <Text className="text-red-400 text-sm mb-4">Failed to load links. Pull to refresh.</Text>
      )}
    </View>
  );
}
