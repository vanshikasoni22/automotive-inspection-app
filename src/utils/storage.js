import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  await AsyncStorage.setItem('inspector_token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('inspector_token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('inspector_token');
};

export const saveInspector = async (inspector) => {
  await AsyncStorage.setItem('inspector_data', JSON.stringify(inspector));
};

export const getInspector = async () => {
  const data = await AsyncStorage.getItem('inspector_data');
  return data ? JSON.parse(data) : null;
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
};