import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useUserFilesQuery } from "@/src/api/links-api";
import FileCard from "@/src/components/file-card";
import FilesListHeader from "@/src/components/files-list-header";
import { getItem } from "@/src/utils/storage";
import { COLORS, LIMIT } from "@/src/constant";
import ScreenView from "@/src/components/safe-area-view-component";

export default function LinkDetailScreen() {
  const { id, token } = useLocalSearchParams<{ id: string; token: string }>();

  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState("");

  const queryClient = useQueryClient();
  const { data, isFetching, isFetchingNextPage, isError, error, fetchNextPage, hasNextPage } =
    useUserFilesQuery(id, token, LIMIT);

  const files = data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    if (!token) return;
    getItem(`key:${token}`).then((saved) => {
      if (saved?.key && saved?.iv) {
        setKey(saved.key);
        setIv(saved.iv);
      }
    });
  }, [token]);

  function handleSetKeyIv() {
    try {
      const parsed = JSON.parse(keyInputValue.trim());
      if (parsed.key && parsed.iv) {
        setKey(parsed.key);
        setIv(parsed.iv);
        setShowKeyInput(false);
        setKeyInputValue("");
      } else {
        Alert.alert("Invalid", 'JSON must contain "key" and "iv" fields.');
      }
    } catch {
      Alert.alert("Invalid", "Please paste valid JSON format.");
    }
  }

  function handleRefresh() {
    queryClient.resetQueries({ queryKey: ["files", id, token] });
  }

  return (
    <ScreenView>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-zinc-800">
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/links")}
          className="flex-row items-center"
          style={{ gap: 6 }}
        >
          <AntDesign name="arrow-left" size={15} color={COLORS.iconSubtle} />
          <Text className="text-zinc-400 text-sm">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowKeyInput(!showKeyInput)}
          className="flex-row items-center bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800"
          style={{ gap: 6 }}
        >
          <Text className="text-zinc-400 text-sm">{showKeyInput ? "Cancel" : "Add Key/IV"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        onRefresh={handleRefresh}
        refreshing={isFetching && !isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <FilesListHeader
            hasKey={!!key}
            showKeyInput={showKeyInput}
            keyInputValue={keyInputValue}
            isError={isError}
            errorMessage={error?.message}
            onKeyInputChange={setKeyInputValue}
            onSetKeyIv={handleSetKeyIv}
            onCancelKeyInput={() => setShowKeyInput(false)}
          />
        }
        renderItem={({ item }) => (
          <FileCard file={item} token={token} linkId={id} encryptionKey={key} iv={iv} />
        )}
        ListEmptyComponent={
          !isFetching ? (
            <View className="items-center mt-20">
              <View className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 items-center justify-center mb-4">
                <AntDesign name="folder-open" size={22} color={COLORS.iconDim} />
              </View>
              <Text className="text-zinc-400 font-medium">No files uploaded yet</Text>
              <Text className="text-zinc-600 text-sm mt-1">
                Share the link to receive encrypted files.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null
        }
      />
    </ScreenView>
  );
}
