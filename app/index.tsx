import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { deleteEditedImage, getEditedImages, initDB } from '../src/db';

interface EditedImage {
  id: number;
  original_uri: string;
  edited_uri: string;
  timestamp: string;
}

export default function Index() {
  const router = useRouter();
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await initDB();
      loadEditedImages();
    };
    initialize();
  }, []);

  const loadEditedImages = async () => {
    const images = await getEditedImages();
    setEditedImages(images as EditedImage[]);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/edit',
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const deleteImage = async (id: number) => {
    await deleteEditedImage(id);
    loadEditedImages();
  };

  const renderItem = ({ item }: { item: EditedImage }) => (
    <View style={{ margin: 10, alignItems: 'center' }}>
      <Image source={{ uri: item.edited_uri }} style={{ width: 100, height: 100 }} />
      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 5, marginTop: 5 }}
        onPress={() => deleteImage(item.id)}
      >
        <Text style={{ color: 'white' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Image Editor</Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={pickImage}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Pick an Image to Edit</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>Edited Images:</Text>

      <FlatList
        data={editedImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
      />
    </View>
  );
}
