import { useState } from "react";
import { View, Text, ScrollView, Share, Alert, ActivityIndicator } from "react-native";
import Input from "@/src/components/input";
import Button from "@/src/components/button";
import Toggle from "@/src/components/toggle";
import ScreenView from "@/src/components/safe-area-view-component";
import CreateLinkUnits, { type Unit } from "@/src/components/create-link-units";
import { useCreateLink } from "@/src/api/links-api";
import { generateKeyAndIV } from "@/src/utils/crypto";
import { setItem } from "@/src/utils/storage";
import { useAuth } from "@/src/zustand/user-store";
import { UPLOAD_URL, COLORS } from "@/src/constant";

function getExpiresAt(amount: string, unit: Unit): string {
  const now = new Date();
  const n = parseInt(amount) || 1;
  if (unit === "Hours") now.setHours(now.getHours() + n);
  if (unit === "Days") now.setDate(now.getDate() + n);
  if (unit === "Weeks") now.setDate(now.getDate() + n * 7);
  return now.toISOString();
}

function defaultMaxUploads(plan: string): string {
  if (plan === "pro") return "5";
  if (plan === "enterprise") return "10";
  return "3";
}

export default function CreateLinkScreen() {
  const user = useAuth((s) => s.user);
  const plan = user?.subscription?.planName ?? "free";

  const [linkName, setLinkName] = useState("");
  const [maxUploads, setMaxUploads] = useState(defaultMaxUploads(plan));
  const [expiryAmount, setExpiryAmount] = useState("1");
  const [expiryUnit, setExpiryUnit] = useState<Unit>("Hours");
  const [downloadKey, setDownloadKey] = useState(true);
  const [expireAfterFirst, setExpireAfterFirst] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const { mutate, isPending, error } = useCreateLink();

  async function handleGenerate() {
    const { key, iv } = generateKeyAndIV();
    const expiresAt = getExpiresAt(expiryAmount, expiryUnit);

    mutate(
      {
        name: linkName || undefined,
        maxUploads: parseInt(maxUploads) || 1,
        expiresAt,
        expireAfterFirstUpload: expireAfterFirst,
        iv,
      },
      {
        onSuccess: async (data) => {
          const fullLink = `${UPLOAD_URL}?token=${data.token}#key=${key}&iv=${iv}`;
          setGeneratedLink(fullLink);
          await setItem(`key:${data.token}`, { key, iv });
          if (downloadKey) {
            await Share.share({
              message: JSON.stringify({ link: fullLink, key, iv }, null, 2),
              title: "OpenFile Encryption Key",
            }).catch(() => {});
          }
        },
      },
    );
  }

  async function handleShare() {
    try {
      await Share.share({ message: generatedLink });
    } catch {
      Alert.alert("Error", "Could not share the link");
    }
  }

  return (
    <ScreenView>
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-zinc-100 mt-6 mb-1">Create Secure Link</Text>
        <Text className="text-zinc-400 mb-6">
          Generate an encrypted upload link to privately receive files.
        </Text>

        <Input
          label="Link Name (optional)"
          value={linkName}
          onChangeText={setLinkName}
          placeholder="e.g. Client project files"
        />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Input
              label="Max Uploads"
              value={maxUploads}
              onChangeText={setMaxUploads}
              keyboardType="number-pad"
              placeholder="3"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Expires In"
              value={expiryAmount}
              onChangeText={setExpiryAmount}
              keyboardType="number-pad"
              placeholder="1"
            />
          </View>
        </View>

        <CreateLinkUnits value={expiryUnit} onValueChange={setExpiryUnit} />

        <View className="bg-zinc-900 rounded-xl px-4 mb-6">
          <Toggle
            label="Download encryption key file"
            description="Save the key/IV backup to your device"
            value={downloadKey}
            onValueChange={setDownloadKey}
          />
          <View className="h-px bg-zinc-700" />
          <Toggle
            label="Expire after first upload"
            description="Link becomes invalid after one use"
            value={expireAfterFirst}
            onValueChange={setExpireAfterFirst}
          />
        </View>

        {error && <Text className="text-red-400 mb-4 text-sm">{error.message}</Text>}

        <Button
          title={isPending ? "Generating..." : "Generate Link"}
          onPress={handleGenerate}
          disabled={isPending}
          className="w-full mb-6"
        />

        {isPending && <ActivityIndicator className="mb-4" color={COLORS.brand} />}

        {generatedLink ? (
          <View className="bg-zinc-900 rounded-xl p-4 mb-8">
            <Text className="text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-2">
              Generated Link
            </Text>
            <Text className="text-zinc-300 text-sm mb-4" numberOfLines={3}>
              {generatedLink}
            </Text>
            <Button title="Share Link" variant="outline" onPress={handleShare} className="w-full" />
          </View>
        ) : (
          <View className="bg-zinc-900 rounded-xl p-6 items-center mb-8">
            <Text className="text-zinc-500 text-sm">Your generated link will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenView>
  );
}
