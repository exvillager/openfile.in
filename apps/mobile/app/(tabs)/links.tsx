import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import ScreenView from "@/src/components/safe-area-view-component";
import LinkCard from "@/src/components/link-card";
import LinksListHeader from "@/src/components/links-list-header";
import { useUserLinksQuery, useLinkCount, useStorageUsedQuery } from "@/src/api/links-api";
import { COLORS, LIMIT } from "@/src/constant";

function formatBytes(bytes: number) {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

export default function LinksScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isFetching, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserLinksQuery(debouncedSearch, LIMIT);

  const { data: linkCountData, refetch: refetchCount } = useLinkCount();
  const { data: storageData, refetch: refetchStorage } = useStorageUsedQuery();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const links = data?.pages.flatMap((p) => p.data) ?? [];
  const storageUsed = storageData?.data?.storageUsed ?? 0;
  const linkCount = linkCountData?.links ?? 0;

  function handleRefresh() {
    queryClient.resetQueries({ queryKey: ["links"] });
    refetchCount();
    refetchStorage();
  }

  return (
    <ScreenView>
      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        onRefresh={handleRefresh}
        refreshing={isFetching && !isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <LinksListHeader
            linkCount={linkCount}
            storageUsed={formatBytes(storageUsed)}
            search={search}
            onSearchChange={setSearch}
            isError={isError}
          />
        }
        renderItem={({ item }) => <LinkCard link={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-16">
              <AntDesign name="link" size={40} color={COLORS.iconDim} />
              <Text className="text-zinc-500 mt-3 text-center">
                {search ? "No links match your search." : "No links yet.\nCreate your first one."}
              </Text>
            </View>
          ) : (
            <ActivityIndicator className="mt-16" color={COLORS.brand} />
          )
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
