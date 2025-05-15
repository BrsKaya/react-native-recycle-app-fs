import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Profile() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      if (!user?._id) {
        console.log('No user ID available');
        return;
      }
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token available');
        return;
      }
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.user) {
        setUserData(data.user);
        setCoins(data.user.coins || 0);
      } else {
        console.log('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData().finally(() => setRefreshing(false));
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
    }
  };

  if (!userData) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Yesil Adımlar</Text>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {userData.username ? userData.username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{userData.username || 'Kullanıcı'}</Text>
          <View style={styles.coinBadgeBelow}>
            <FontAwesome5 name="coins" size={18} color="#ffd700" />
            <Text style={styles.coinText}>{coins}</Text>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.inputContainerr}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={22} color="#E1EEBC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email || ''}
                placeholder="Your Email"
                placeholderTextColor="#E1EEBC"
                editable={false}
              />
            </View>
          </View>
          <View style={styles.inputContainerr}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={22} color="#E1EEBC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.password ? '**********' : '**********'}
                placeholder="Password"
                placeholderTextColor="#E1EEBC"
                secureTextEntry
                editable={false}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 36,
    color: "#E1EEBC",
    fontFamily: "cursive",
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 12,
  },
  loadingText: {
    color: '#E1EEBC',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E1EEBC',
    marginBottom: 10,
    marginTop: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: '#E1EEBC',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 22,
    color: '#E1EEBC',
    marginTop: 5,
    fontWeight: 'bold',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
    marginTop: 30,
  },
  inputContainerr: {
    backgroundColor: '#E1EEBC',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9D2AE',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#E1EEBC',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#2E6B56',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 5,
    borderColor: '#E1EEBC',
  },
  logoutButtonText: {
    color: '#E1EEBC',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  coinBadgeBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  coinText: {
    color: '#ffd700',
    fontWeight: 'bold',
    marginLeft: 3,
    fontSize: 16,
  },
});
