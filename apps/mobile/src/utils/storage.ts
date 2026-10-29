import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key: string, value: any) =>
  AsyncStorage.setItem(key, JSON.stringify(value));

export const getItem = async (key: string) => {
  const val = await AsyncStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

export const removeItem = async (key: string) => AsyncStorage.removeItem(key);

export const clear = async () => AsyncStorage.clear();
