import React from "react";
import { Pressable, Text, PressableProps } from "react-native";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyle = "px-5 py-3 rounded-full items-center justify-center";

  let variantStyle = "";
  switch (variant) {
    case "primary":
      variantStyle = "bg-indigo-600";
      break;
    case "secondary":
      variantStyle = "bg-zinc-700";
      break;
    case "outline":
      variantStyle = "border border-indigo-500";
      break;
    default:
      variantStyle = "bg-indigo-600";
  }

  const textStyle =
    variant === "outline" ? "text-indigo-400 font-semibold" : "text-white font-semibold";

  return (
    <Pressable onPress={onPress} className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      <Text className={textStyle}>{title}</Text>
    </Pressable>
  );
};

export default Button;
