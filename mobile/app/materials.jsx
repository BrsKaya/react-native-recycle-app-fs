import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Materials() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState({
    plastic: 0,
    glass: 0,
    metal: 0,
    paper: 0,
    organic: 0
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
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
        setMaterials({
          plastic: data.user.plastic || 0,
          glass: data.user.glass || 0,
          metal: data.user.metal || 0,
          paper: data.user.paper || 0,
          organic: data.user.organic || 0
        });
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E1EEBC" />
        </View>
      </LinearGradient>
    );
  }

  const totalMaterials =
    materials.plastic +
    materials.paper +
    materials.glass +
    materials.organic +
    materials.metal;

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Materials</Text>
        </View>

        {/* Materials List */}
        <View style={styles.materialsContainer}>
          <View style={styles.materialItem}>
            <MaterialCommunityIcons name="bottle-soda" size={32} color="#2E6B56" />
            <Text style={styles.materialText}>Plastic</Text>
            <Text style={styles.materialCount}>{materials.plastic} items</Text>
          </View>

          <View style={styles.materialItem}>
            <MaterialCommunityIcons name="newspaper" size={32} color="#2E6B56" />
            <Text style={styles.materialText}>Paper</Text>
            <Text style={styles.materialCount}>{materials.paper} items</Text>
          </View>

          <View style={styles.materialItem}>
            <MaterialCommunityIcons name="glass-fragile" size={32} color="#2E6B56" />
            <Text style={styles.materialText}>Glass</Text>
            <Text style={styles.materialCount}>{materials.glass} items</Text>
          </View>

          <View style={styles.materialItem}>
            <MaterialCommunityIcons name="apple" size={32} color="#2E6B56" />
            <Text style={styles.materialText}>Organic</Text>
            <Text style={styles.materialCount}>{materials.organic} items</Text>
          </View>

          <View style={styles.materialItem}>
            <MaterialCommunityIcons name="tools" size={32} color="#2E6B56" />
            <Text style={styles.materialText}>Metal</Text>
            <Text style={styles.materialCount}>{materials.metal} items</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E1EEBC' }}>
            Total Materials: {totalMaterials}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'serif',
  },
  materialsContainer: {
    padding: 24,
  },
  materialItem: {
    backgroundColor: '#E1EEBC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  materialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E6B56',
    flex: 1,
    marginLeft: 16,
  },
  materialCount: {
    fontSize: 16,
    color: '#2E6B56',
    opacity: 0.7,
  },
}); 