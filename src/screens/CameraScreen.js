import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createInspection } from '../services/api';
import { getInspector, clearStorage } from '../utils/storage';

export default function CameraScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [partName, setPartName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please capture or select a part image');
      return;
    }
    if (!partName.trim()) {
      Alert.alert('Error', 'Please enter the part name');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'part-image.jpg',
      });
      formData.append('part_name', partName.trim());
      formData.append('notes', notes.trim());

      const response = await createInspection(formData);
      navigation.navigate('Result', { inspection: response.data.inspection });
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed. Try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearStorage();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>New Inspection</Text>
          <Text style={styles.subtitle}>Capture or upload part image</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Image Area */}
      <View style={styles.imageArea}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Image Buttons */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.imageButton, { marginRight: 8 }]}
          onPress={() => pickImage(true)}
        >
          <Text style={styles.imageButtonText}>📷  Use Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageButton, { marginLeft: 8 }]}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.imageButtonText}>🖼  Upload Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Part Details */}
      <View style={styles.form}>
        <Text style={styles.label}>Part Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Front Bumper, Hood, Door Panel"
          placeholderTextColor="#555"
          value={partName}
          onChangeText={setPartName}
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any observations about the part..."
          placeholderTextColor="#555"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Analyze Part →</Text>
        )}
      </TouchableOpacity>

      {/* History Link */}
      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyLinkText}>View Inspection History</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#555',
    fontSize: 13,
    marginTop: 4,
  },
  logout: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  imageArea: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#444',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  historyLink: {
    alignItems: 'center',
    padding: 12,
  },
  historyLinkText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
});