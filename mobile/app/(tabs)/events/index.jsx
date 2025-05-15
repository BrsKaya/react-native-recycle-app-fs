import { View, Text, Button, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import styles from "../../../assets/styles/home.styles";
import { useRouter } from 'expo-router';
import { useAuthStore} from "../../../store/authStore"
import { API_URL } from '../../../constants/api';
import {Image} from "expo-image"
import { formatPublishDate } from '../../../lib/utils';
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import COLORS from '../../../constants/colors';
import Loader from '../../../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EventsPage() {
  const router = useRouter();
  const {token, user} = useAuthStore();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({
    username: user?.username || '',
    coins: user?.coins || 0,
    profileImage: user?.profileImage || null
  });

  const fetchEvents = async(pageNum=1, refresh=false) => {
    try {
      setError(null);
      if(refresh) setRefreshing(true);
      else if(pageNum === 1) setLoading(true);

      // Token kontrolü
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        console.log('No token found in storage');
        setError('Authentication required');
        return;
      }

      // Önce token'ı doğrula
      const validateResponse = await fetch(`${API_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (!validateResponse.ok) {
        console.log('Token validation failed');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setError('Session expired. Please login again.');
        return;
      }

      const validateData = await validateResponse.json();
      if (!validateData.valid) {
        console.log('Token is invalid');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setError('Session expired. Please login again.');
        return;
      }

      // Token geçerli, events'i getir
      const response = await fetch(`${API_URL}/events?page=${pageNum}&limit=5`,{
        headers:{
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Events response:', data);
      
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid data format received from server');
      }

      const uniqueEvents = refresh || pageNum === 1
        ? data.events
        : Array.from(new Set([...events, ...data.events].map((event) => event._id)))
            .map((id) => [...events, ...data.events].find((event) => event._id === id));

      setEvents(uniqueEvents);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);

    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message);
    } finally {
      if(refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username || '',
        coins: user.coins || 0,
        profileImage: user.profileImage || null
      });
    }
  }, [user]);

  const handleLoadMore = async() => {
    if(hasMore && !loading && !refreshing){
      await fetchEvents(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchEvents(1, true);
  };
  
  const renderItem = ({item}) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => router.push(`/events/${item._id}`)}
    >
      <View style={styles.bookHeader}>
        <View style={[styles.bookCardS, { maxWidth: '105%' }]}>
          <View style={styles.userInfo}>
            {item.user?.profileImage ? (
              <Image 
                source={{uri: item.user.profileImage}} 
                style={[styles.avatar, { width: 40, height: 40 }]}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, { width: 60, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center'}]}>
                <Text style={{color: '#E1EEBC', fontWeight: 'bold', fontSize: 18}}>
                  {item.user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={[styles.username, { fontSize: 14 }]} numberOfLines={1} ellipsizeMode="tail">
                {item.user?.username || 'User'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bookDetails}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="#2E6B56" />
        </View>
        <Text style={styles.caption} numberOfLines={2} ellipsizeMode="tail">{item.caption}</Text>
        <Text style={styles.eventDate}>
          Event date: {new Date(item.eventDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <Text style={styles.eventDate}>Location: {item.location}</Text>
      </View>
    </TouchableOpacity>
  );
  
  if(loading) return <Loader size="large" />;

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      {/* HEADER */}
      <View style={{ padding: 16 }}>
        <Text style={styles.headerTitle}>Green Steps</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {userData.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={[styles.avatar, { 
                  width: 50, 
                  height: 50, 
                  borderWidth: 2,
                  borderColor: '#fff',
                  borderRadius: 25
                }]}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, { 
                width: 50, 
                height: 50, 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                justifyContent: 'center', 
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: 25
              }]}> 
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                  {userData.username ? userData.username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View>
              <Text style={{ color: '#fff', fontSize: 13 ,opacity: 0.8,}}>Welcome,</Text>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{userData.username}</Text>
            </View>
          </View>
          <View style={styles.coinRow}>
            <FontAwesome5 name="coins" size={20} color="#FFD700" />
            <Text style={{ color: '#FFD700', fontWeight: 'bold', marginLeft: 6 }}>{userData.coins}</Text>
          </View>
        </View>
        {/* EVENTS HEADER + BUTTON */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
          <View style={{ 
            backgroundColor: '#C9D2AE', 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            borderRadius: 12,
            flex: 1,
            marginRight: 8
          }}>
            <Text style={{ fontSize: 20, color: '#2E6B56', fontWeight: 'bold' }}>Events</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/events/create')} 
            style={{ backgroundColor: '#E1EEBC', borderRadius: 20, padding: 6 }}
          >
            <Ionicons name="add" size={24} color="#2E6B56" />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            style={{ marginTop: 8, padding: 8, backgroundColor: '#E1EEBC', borderRadius: 8 }}
          >
            <Text style={{ color: '#2E6B56' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* EVENTS LIST */}
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2E6B56"]}
            tintColor={"#2E6B56"}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          hasMore && events.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={"#2E6B56"} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={60} color={"#E1EEBC"} style={{ marginTop: 20 }} />
            <Text style={styles.emptyText}>No event yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a event</Text>
          </View>
        }
      />
    </LinearGradient>
  )
}