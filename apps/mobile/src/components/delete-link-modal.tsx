import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteLink } from "@/src/api/links-api";

interface Props {
  visible: boolean;
  linkId: string;
  linkName: string;
  onClose: () => void;
}

export default function DeleteLinkModal({ visible, linkId, linkName, onClose }: Props) {
  const queryClient = useQueryClient();
  const { mutate: deleteLink, isPending } = useDeleteLink();

  function handleConfirm() {
    deleteLink(linkId, {
      onSuccess: () => {
        onClose();
        queryClient.invalidateQueries({ queryKey: ["links"] });
        queryClient.invalidateQueries({ queryKey: ["linkCount"] });
      },
      onError: (err) => {
        onClose();
        Alert.alert("Error", err.message);
      },
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <View
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
          style={{ width: "85%" }}
        >
          <Text className="text-zinc-100 text-lg font-bold mb-2">Delete Link</Text>
          <Text className="text-zinc-400 text-sm mb-6">
            Are you sure you want to delete the link? this cannot be undone.
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 items-center"
            >
              <Text className="text-zinc-300 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 items-center"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
