import { View, Text, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';

export default function Home() {
  const router = useRouter();
  const { user, updateUserData } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: '',
    coins: 0,
    profileImage: null
  });
  const [materials, setMaterials] = useState({
    plastic: 0,
    glass: 0,
    metal: 0,
    paper: 0,
    organic: 0
  });

  const fetchUserData = async () => {
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
        const newUserData = {
          username: data.user.username || '',
          coins: data.user.coins || 0,
          profileImage: data.user.profileImage || null
        };
        const newMaterials = {
          plastic: data.user.plastic || 0,
          glass: data.user.glass || 0,
          metal: data.user.metal || 0,
          paper: data.user.paper || 0,
          organic: data.user.organic || 0
        };

        setUserData(newUserData);
        setMaterials(newMaterials);
        updateUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa her odaklandığında verileri güncelle
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [user?._id])
  );

  const calculateTotalMaterials = () => {
    return materials.plastic + materials.glass + materials.metal + materials.paper + materials.organic;
  };

  const calculateCO2Savings = () => {
    return (materials.plastic * 60) + (materials.paper * 70) + (materials.glass * 25) + (materials.organic * 100) + (materials.metal * 200);
  };

  const calculateProgress = () => {
    const total = calculateTotalMaterials();
    return Math.min((total % 50) / 50 * 100, 100);
  };

  const calculateLevel = () => {
    const total = calculateTotalMaterials();
    return Math.floor(total / 50) + 1;
  };

  const calculateNextLevelProgress = () => {
    const total = calculateTotalMaterials();
    return total % 50;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={styless.container}>
        <View style={styless.loadingContainer}>
          <ActivityIndicator size="large" color="#E1EEBC" />
        </View>
      </LinearGradient>
    );
  }

  const totalMaterials = calculateTotalMaterials();
  const progress = calculateNextLevelProgress() / 50;
  const currentLevel = calculateLevel();
  const nextLevelProgress = calculateNextLevelProgress();

  const CIRCLE_SIZE = 120;
  const STROKE_WIDTH = 10;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styless.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        {/* Header */}
        <View style={styless.header}>
          <Text style={styless.headerTitle}>Yesil Adımlar</Text>
        </View>

        {/* Profile & Coin */}
        <View style={styless.profileRow}>
          <View style={styless.profileInfo}>
            {userData.profileImage ? (
              <ExpoImage
                source={{ uri: userData.profileImage }}
                style={styless.avatar}
                contentFit="cover"
                transition={1000}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styless.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                  {userData.username ? userData.username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styless.welcome}>Welcome,</Text>
              <Text style={styless.username}>{userData.username}</Text>
            </View>
          </View>
          <View style={styless.coinRow}>
            <FontAwesome5 name="coins" size={20} color="#FFD700" />
            <Text style={styless.coinText}>{userData.coins}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <TouchableOpacity 
          style={styless.levelBox}
          onPress={() => router.push('/materials')}
        >
          <View style={styless.progressCircle}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              {/* Gri arka plan */}
              <Circle
                stroke="#C9D2AE"
                fill="none"
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
              />
              {/* Yeşil progress */}
              <Circle
                stroke="#2E6B56"
                fill="none"
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                strokeLinecap="round"
                rotation="-90"
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            </Svg>
            <View style={styless.progressIconCenter}>
              <MaterialCommunityIcons name="recycle" size={48} color="#2E6B56" style={styless.recycleIcon} />
            </View>
          </View>
          <Text style={styless.levelText}>Level {currentLevel}</Text>
          <Text style={styless.recycleNeeded}>{nextLevelProgress}/50 Recycle needed</Text>
        </TouchableOpacity>

        {/* Bottom Boxes */}
        <View style={styless.bottomRow}>
          <View style={styless.co2Box}>
            <MaterialCommunityIcons name="cloud" size={32} color="#2E6B56" />
            <Text style={styless.co2Value}>{calculateCO2Savings()}g</Text>
            <Text style={styless.co2Label}>SAVED CO2</Text>
          </View>
          <View style={styless.rightCol}>
            <TouchableOpacity 
              style={styless.actionBox}
              onPress={() => router.push('/carbon-footprint')}
            >
              <MaterialCommunityIcons name="foot-print" size={28} color="#2E6B56" />
              <Text style={styless.actionText}>Calculate Carbon Footprint</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styless.actionBox}
              onPress={() => router.push('/rewards')}
            >
              <MaterialCommunityIcons name="gift" size={28} color="#2E6B56" />
              <Text style={styless.actionText}>Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styless = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 28,
  },
  headerTitle: {
    fontSize: 36,
    color: "#E1EEBC",
    fontFamily: "cursive",
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 0,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 28,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 28,
  },
  coinText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 6,
  },
  levelBox: {
    backgroundColor: '#E1EEBC',
    borderRadius: 24,
    marginHorizontal: 24,
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 12,
    
  },
  progressCircle: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 30,
    position: 'relative',
  },
  progressIconCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  recycleIcon: {
    zIndex: 2,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E6B56',
    marginBottom: 10,
  },
  recycleNeeded: {
    fontSize: 16,
    color: '#2E6B56',
    opacity: 0.7,
    marginTop: 0,
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 10,
    gap: 16,
    marginBottom: 24,
  },
  co2Box: {
    flex: 1,
    backgroundColor: '#E1EEBC',
    borderRadius: 24,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  co2Value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E6B56',
    marginVertical: 4,
  },
  co2Label: {
    fontSize: 12,
    color: '#2E6B56',
    opacity: 0.7,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  actionBox: {
    backgroundColor: '#E1EEBC',
    borderRadius: 24,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 70,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E6B56',
    flex: 1,
  },
});