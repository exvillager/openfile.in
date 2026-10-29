import { useRef, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { COLORS } from "@/src/constant";
import ScreenView from "@/src/components/safe-area-view-component";
import Input from "@/src/components/input";
import Button from "@/src/components/button";
import { useLogin, useRegister } from "@/src/api/api";

type Tab = "login" | "register";

export default function AuthScreen() {
  const passwordRef = useRef<TextInput>(null);
  const [tab, setTab] = useState<Tab>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>(
    {},
  );

  const { mutate: login, isPending: loginPending, error: loginError } = useLogin();
  const { mutate: register, isPending: registerPending, error: registerError } = useRegister();

  const isPending = loginPending || registerPending;
  const apiError = loginError || registerError;

  function switchTab(t: Tab) {
    setTab(t);
    setErrors({});
  }

  function validate() {
    const next: typeof errors = {};
    if (!username) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Minimum 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (tab === "login") {
      login({ username, password }, { onSuccess: () => router.replace("/(tabs)") });
    } else {
      register({ username, password }, { onSuccess: () => router.replace("/(tabs)") });
    }
  }

  return (
    <ScreenView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6">
            <Text className="text-3xl font-bold text-zinc-100 mb-2">OpenFile</Text>
            <Text className="text-zinc-400 mb-8">
              The private way to receive files from anyone.
            </Text>

            {/* Tab toggle */}
            <View className="flex-row bg-zinc-900 rounded-xl p-1 mb-8">
              {(["login", "register"] as Tab[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => switchTab(t)}
                  className={`flex-1 py-2 rounded-lg items-center ${tab === t ? "bg-indigo-600" : ""}`}
                >
                  <Text
                    className={`font-semibold text-sm ${tab === t ? "text-white" : "text-zinc-400"}`}
                  >
                    {t === "login" ? "Sign In" : "Register"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="your username"
              autoCapitalize="none"
              error={errors.username}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Input
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {apiError && <Text className="text-red-400 mb-4 text-sm">{apiError.message}</Text>}

            <Button
              title={isPending ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
              onPress={handleSubmit}
              disabled={isPending}
              className="mt-2 w-full"
            />

            {isPending && <ActivityIndicator className="mt-4" color={COLORS.brand} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}
