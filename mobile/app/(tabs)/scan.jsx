import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function Scan() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [recycletype, setRecycleType] = useState('');
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        console.log('Stored user:', userJson);
        if (!userJson) {
          Alert.alert('Error', 'Please log in again');
          return;
        }
        const parsedUser = JSON.parse(userJson);
        console.log('Parsed user:', parsedUser);
        if (!parsedUser._id) {
          Alert.alert('Error', 'User information is missing');
          return;
        }
      } catch (error) {
        console.error('Error checking user:', error);
        Alert.alert('Error', 'An error occurred while checking user information');
      }
    };

    checkUser();
  }, []);

  const cameraRef = useRef(null);

  const wasteTypes = [
    { id: 'plastic', label: 'Plastic', icon: 'bottle-soda' },
    { id: 'metal', label: 'Metal', icon: 'cog' },
    { id: 'glass', label: 'Glass', icon: 'glass-fragile' },
    { id: 'paper', label: 'Paper', icon: 'newspaper' },
    { id: 'organic', label: 'Organic', icon: 'leaf' }
  ];

  if (!permission) {
    return <View style={styles.centered}><Text>Loading permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        // skipProcessing: true, makes the photo capture faster,
        // especially noticeable on iOS. Effect may vary on Android.
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: Platform.OS === 'ios', // true for iOS, false for Android (decide by testing)
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error("Could not take photo:", error);
        alert("An error occurred while taking the photo.");
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!recycletype.trim()) {
      alert("Please enter a waste type.");
      return;
    }

    try {
      const userJson = await AsyncStorage.getItem('user');
      console.log('Raw user data from storage:', userJson);
      
      if (!userJson) {
        Alert.alert('Error', 'Please log in again');
        return;
      }
      
      const parsedUser = JSON.parse(userJson);
      console.log('Parsed user data:', parsedUser);
      console.log('User ID:', parsedUser._id);

      if (!parsedUser._id) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      // Convert recycletype to lowercase for case-insensitive comparison
      const materialType = recycletype.toLowerCase();
      console.log('Material type:', materialType);
      
      // Map the input to the corresponding material field
      let materialField;
      switch (materialType) {
        case 'plastic':
          materialField = 'plasticMaterial';
          break;
        case 'glass':
          materialField = 'glassMaterial';
          break;
        case 'metal':
          materialField = 'metalMaterial';
          break;
        case 'paper':
          materialField = 'paperMaterial';
          break;
        case 'organic':
          materialField = 'organicMaterial';
          break;
        default:
          Alert.alert("Error", "Invalid waste type. Please enter 'plastic', 'glass', 'metal', 'paper' or 'organic'.");
          return;
      }

      console.log('Selected material field:', materialField);

      const requestData = {
        userId: parsedUser._id,
        materialField: materialField
      };
      console.log('Request data:', requestData);

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Session information not found. Please log in again.');
        return;
      }

      // Update the user's material count
      const response = await axios.post(
        `${API_URL}/users/update-material`, 
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Response:', response.data);

      if (response.data.success) {
        Alert.alert(
          "Success", 
          `${materialType} waste successfully recorded!\nYou earned ${response.data.coinReward} coins!`,
          [{ text: 'OK' }]
        );
        setRecycleType('');
        setCapturedImage(null);
      } else {
        Alert.alert("Error", "An error occurred while saving the waste.");
      }
    } catch (error) {
      console.error("Error updating material:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error request data:", error.config?.data);
      Alert.alert("Error", "An error occurred while saving the waste.");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setRecycleType('');
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      {capturedImage && (
        <View style={styles.overlayContainer}>
          <Image source={{ uri: capturedImage }} style={styles.frozenImage} />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.formWrapper}
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          >
            <View style={styles.formContent}>
              <Text style={styles.selectionTitle}>Select Waste Type</Text>
              <View style={styles.wasteTypeGrid}>
                {wasteTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.wasteTypeButton,
                      recycletype === type.id && styles.selectedWasteType
                    ]}
                    onPress={() => setRecycleType(type.id)}
                  >
                    <MaterialCommunityIcons name={type.icon} size={24} color={recycletype === type.id ? '#2E6B56' : '#E1EEBC'} />
                    <Text style={[
                      styles.wasteTypeText,
                      recycletype === type.id && styles.selectedWasteTypeText
                    ]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.formButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.saveButton]} 
                  onPress={handleFormSubmit}
                  disabled={!recycletype}
                >
                  <Text style={styles.formButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.formButton, styles.retakeButton]} onPress={handleRetake}>
                  <Text style={styles.formButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {!capturedImage && (
        // Kamera aktifken gösterilecek fotoğraf çekme butonu
        <View style={styles.bottomControlsContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Kamera yüklenene kadar veya arkası için
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject, // Tüm ekranı kapla
    justifyContent: 'flex-end', // formWrapper'ı genel olarak alta yaslar
  },
  frozenImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  formWrapper: {
    // Klavye için sarmalayıcı ve formun konumunu belirler
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: height * 0.1, 
    paddingHorizontal: 25, 
  },
  formContent: {
    backgroundColor: 'transparent',
    paddingVertical: 10, // Input ve butonlar arası dikey boşluk
    alignItems: 'center', // İçerikleri (özellikle tek input'u) ortalamak için
  },
  selectionTitle: {
    color: '#E1EEBC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  wasteTypeButton: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  selectedWasteType: {
    backgroundColor: '#E1EEBC',
    borderColor: '#2E6B56',
  },
  wasteTypeText: {
    color: '#E1EEBC',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedWasteTypeText: {
    color: '#2E6B56',
  },
  formButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Butonları iki yana yasla
    width: '100%', // Container'ın tamamını kullan
  },
  formButton: {
    paddingVertical: 14, // Buton yüksekliği
    borderRadius: 50, // Input ile uyumlu yuvarlaklık
    alignItems: 'center',
    flex: 1, // Butonların eşit genişlikte olmasını sağlar
    marginHorizontal: 7, // Butonlar arası yatay boşluk
  },
  saveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.85)', // Yeşil, hafif transparan
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 1)', // Tam opak kenarlık
    marginBottom: 20,
  },
  retakeButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.85)', // Kırmızı, hafif transparan
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 1)', // Tam opak kenarlık
    marginBottom: 20,
  },
  formButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // iOS için home indicator'a boşluk
    paddingTop: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)', // Kamera butonu için yarı saydamlık
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 70,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'white',
  },
});