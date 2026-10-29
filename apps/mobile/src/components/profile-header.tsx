import { Image } from "expo-image";
import { Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "@/src/zustand/user-store";
import { router } from "expo-router";

export const ProfileHeader = () => {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/auth");
  }

  return (
    <View className="justify-center items-center bg-[#0f0f14] py-4">
      <Image
        source={{ uri: "https://cdn.pixabay.com/photo/2025/01/03/13/37/cat-9307910_640.jpg" }}
        style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 8 }}
      />
      <Text className="text-xl font-bold text-zinc-100">
        {user?.name ?? user?.username ?? "Profile"}
      </Text>
      <TouchableOpacity onPress={handleLogout} className="mt-3 bg-red-600 px-6 py-2 rounded-xl">
        <Text className="text-white font-semibold text-sm">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
