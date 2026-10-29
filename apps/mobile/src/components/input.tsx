import React, { useState } from "react";
import { Text, TextInput, View, TextInputProps } from "react-native";
import { COLORS } from "@/src/constant";

interface InputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder = "",
      secureTextEntry = false,
      error,
      className = "",
      labelClassName = "",
      inputClassName = "",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="mb-4 w-full">
        <Text className={`mb-1 text-zinc-300 font-medium ${labelClassName}`}>{label}</Text>
        <TextInput
          ref={ref}
          className={`px-4 py-3 rounded-lg bg-zinc-800 text-zinc-100 ${
            isFocused ? "border-2 border-indigo-500" : "border border-zinc-700"
          } ${inputClassName} ${className}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error ? <Text className="text-red-400 mt-1 text-sm">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = "Input";

export default Input;
