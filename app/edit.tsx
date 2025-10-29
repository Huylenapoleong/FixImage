import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { saveEditedImage } from '../src/db';

export default function EditScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [currentImage, setCurrentImage] = useState<string>(imageUri || '');
  const [originalImage, setOriginalImage] = useState<string>(imageUri || '');

  useEffect(() => {
    if (imageUri) {
      setCurrentImage(imageUri);
      setOriginalImage(imageUri);
    }
  }, [imageUri]);

  const applyFilter = async (action: string) => {
    if (!currentImage) return;

    let manipResult;
    switch (action) {
      case 'grayscale':
        manipResult = await ImageManipulator.manipulateAsync(
          currentImage,
          [{ resize: { width: 300, height: 300 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        break;
      case 'rotate':
        manipResult = await ImageManipulator.manipulateAsync(
          currentImage,
          [{ rotate: 90 }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        break;
      case 'flip':
        manipResult = await ImageManipulator.manipulateAsync(
          currentImage,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        break;
      case 'brightness':
        manipResult = await ImageManipulator.manipulateAsync(
          currentImage,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        break;
      default:
        return;
    }
    setCurrentImage(manipResult.uri);
  };

  const saveImage = async () => {
    if (!currentImage || !originalImage) return;

    try {
      // Request permissions for media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to save to media library is required!');
        return;
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(currentImage);
      console.log('Saved to media library:', asset.uri);

      // Also save to app database
      await saveEditedImage(originalImage, currentImage);
      console.log('Saved to DB');

      Alert.alert('Success', 'Image saved to gallery successfully!');
      router.back();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', `Failed to save image: ${(error as Error).message}`);
    }
  };

  const resetImage = () => {
    setCurrentImage(originalImage);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Edit Image</Text>

      {currentImage ? (
        <Image
          source={{ uri: currentImage }}
          style={{ width: '100%', height: 300, marginBottom: 20 }}
          contentFit="contain"
        />
      ) : (
        <Text>No image selected</Text>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
          onPress={() => applyFilter('grayscale')}
        >
          <Text style={{ color: 'white' }}>Grayscale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
          onPress={() => applyFilter('rotate')}
        >
          <Text style={{ color: 'white' }}>Rotate 90°</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
          onPress={() => applyFilter('flip')}
        >
          <Text style={{ color: 'white' }}>Flip Horizontal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
          onPress={() => applyFilter('brightness')}
        >
          <Text style={{ color: 'white' }}>Brightness</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 5, flex: 1, marginRight: 10 }}
          onPress={resetImage}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#34C759', padding: 15, borderRadius: 5, flex: 1 }}
          onPress={saveImage}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
