import { Text, TouchableOpacity, View } from "react-native";

const UNITS = ["Hours", "Days", "Weeks"] as const;
export type Unit = (typeof UNITS)[number];

interface Props {
  value: Unit;
  onValueChange: (unit: Unit) => void;
}

export default function CreateLinkUnits({ value, onValueChange }: Props) {
  return (
    <View className="flex-row mb-5 bg-zinc-800 p-1.5 rounded-full">
      {UNITS.map((unit) => (
        <TouchableOpacity
          key={unit}
          activeOpacity={0.8}
          onPress={() => onValueChange(unit)}
          className={`flex-1 py-2.5 rounded-full items-center z-10 ${
            value === unit && "bg-indigo-600"
          }`}
        >
          <Text
            className={`text-sm font-medium ${value === unit ? "text-white" : "text-zinc-400"}`}
          >
            {unit}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
