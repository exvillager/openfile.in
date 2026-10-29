import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ScreenView({ children, className = "" }: Props) {
  return (
    <SafeAreaView edges={["top"]} className={`flex-1 bg-background ${className}`}>
      {children}
    </SafeAreaView>
  );
}
