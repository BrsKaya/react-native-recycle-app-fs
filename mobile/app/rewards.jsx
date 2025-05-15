import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Rewards() {
  const router = useRouter();
  const { user, updateUserData } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const products = [
    
    {
      id: 3,
      name: 'Reusable Coffee Cup',
      price: 1500,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500',
      category: 'daily',
      description: 'Eco-friendly coffee cup'
    },
    {
      id: 5,
      name: 'Organic Cotton Tote Bag',
      price: 10000,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
      category: 'daily',
      description: 'Sustainable shopping bag'
    },
    {
      id: 7,
      name: '1 Hour Free Bicycle',
      price: 1000,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
      category: 'transport',
      description: 'City bicycle usage right'
    }
  ];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'daily', name: 'Daily Use' },
    { id: 'tech', name: 'Technology' },
    { id: 'garden', name: 'Garden' },
    { id: 'transport', name: 'Transportation' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handlePurchase = async (product) => {
    if (!user?._id) {
      Alert.alert('Error', 'Please log in.');
      return;
    }

    if (user.coins < product.price) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough coins to purchase this item.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Satın alma işlemi için API çağrısı
      const response = await fetch(`${API_URL}/users/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          productId: product.id,
          productName: product.name,
          price: product.price
        })
      });

      const data = await response.json();

      if (data.success) {
        // Kullanıcı verilerini güncelle
        updateUserData(data.user);
        Alert.alert(
          'Success!',
          `${product.name} successfully purchased!\nRemaining coins: ${data.user.coins}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.message || 'Purchase failed.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An error occurred during the purchase process.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#E1EEBC" />
          </TouchableOpacity>
          <Text style={styles.title}>Reward Store</Text>
          <View style={styles.coinContainer}>
            <FontAwesome5 name="coins" size={20} color="#FFD700" />
            <Text style={styles.coinText}>{user?.coins || 0}</Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productCard,
                user?.coins < product.price && styles.disabledProduct
              ]}
              onPress={() => handlePurchase(product)}
              disabled={loading || user?.coins < product.price}
            >
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.priceContainer}>
                  <FontAwesome5 name="coins" size={16} color="#FFD700" />
                  <Text style={styles.priceText}>{product.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    color: '#E1EEBC',
    fontWeight: 'bold',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#E1EEBC',
  },
  categoryText: {
    color: '#E1EEBC',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#2E6B56',
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#E1EEBC',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  disabledProduct: {
    opacity: 0.5,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E6B56',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#2E6B56',
    opacity: 0.7,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#2E6B56',
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 