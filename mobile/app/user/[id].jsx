import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserData(response.data);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      setError('Error loading user profile');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (totalMaterials) => {
    return Math.floor(totalMaterials / 50) + 1;
  };

  const calculateNextLevelProgress = (totalMaterials) => {
    const currentLevel = calculateLevel(totalMaterials);
    const materialsForNextLevel = currentLevel * 50;
    const remainingMaterials = materialsForNextLevel - totalMaterials;
    return remainingMaterials;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const totalMaterials = userData.user.plastic + userData.user.glass + 
                        userData.user.metal + userData.user.paper + 
                        userData.user.organic;
  const currentLevel = calculateLevel(totalMaterials);
  const nextLevelProgress = calculateNextLevelProgress(totalMaterials);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <LinearGradient
      colors={['#2E6B56', '#90C67C']}
      style={styles.container}
    >
      <ScrollView>
        <LinearGradient
          colors={['#2E6B56', '#90C67C']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#E1EEBC" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userData.user.profileImage ? (
              <Image 
                source={{ uri: userData.user.profileImage }} 
                style={styles.profileImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>
                  {userData.user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.username}>{userData.user.username}</Text>

          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="recycle" size={20} color="#2E6B56" />
              <Text style={styles.levelText}>Level {currentLevel}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(totalMaterials % 50) / 50 * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {nextLevelProgress} more materials to next level
              </Text>
            </View>
          </View>

          <View style={styles.coinsContainer}>
            <FontAwesome5 name="coins" size={20} color="#FFD700" />
            <Text style={styles.coinsText}>{userData.user.coins}</Text>
          </View>
        </View>

        <View style={styles.materialsSection}>
          <Text style={styles.sectionTitle}>Recycled Materials</Text>
          <View style={styles.materialsGrid}>
            <View style={styles.materialItem}>
              <MaterialCommunityIcons name="bottle-soda" size={32} color="#2E6B56" />
              <Text style={styles.materialText}>Plastic</Text>
              <Text style={styles.materialCount}>{userData.user.plastic} items</Text>
            </View>

            <View style={styles.materialItem}>
              <MaterialCommunityIcons name="newspaper" size={32} color="#2E6B56" />
              <Text style={styles.materialText}>Paper</Text>
              <Text style={styles.materialCount}>{userData.user.paper} items</Text>
            </View>

            <View style={styles.materialItem}>
              <MaterialCommunityIcons name="glass-fragile" size={32} color="#2E6B56" />
              <Text style={styles.materialText}>Glass</Text>
              <Text style={styles.materialCount}>{userData.user.glass} items</Text>
            </View>

            <View style={styles.materialItem}>
              <MaterialCommunityIcons name="apple" size={32} color="#2E6B56" />
              <Text style={styles.materialText}>Organic</Text>
              <Text style={styles.materialCount}>{userData.user.organic} items</Text>
            </View>

            <View style={styles.materialItem}>
              <MaterialCommunityIcons name="tools" size={32} color="#2E6B56" />
              <Text style={styles.materialText}>Metal</Text>
              <Text style={styles.materialCount}>{userData.user.metal} items</Text>
            </View>
          </View>

          <View style={styles.totalMaterials}>
            <Text style={styles.totalMaterialsText}>
              Total Materials: {totalMaterials}
            </Text>
          </View>
        </View>

        {/* Created Events Section */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Created Events</Text>
          {userData.createdEvents && userData.createdEvents.length > 0 ? (
            userData.createdEvents.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => router.push(`/events/${event._id}`)}
              >
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events created yet</Text>
          )}
        </View>

        {/* Participated Events Section */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Participated Events</Text>
          {userData.participatedEvents && userData.participatedEvents.length > 0 ? (
            userData.participatedEvents.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => router.push(`/events/${event._id}`)}
              >
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events participated yet</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E1EEBC',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    height: 100,
    justifyContent: 'flex-end',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E1EEBC',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#2E6B56',
  },
  profileImagePlaceholder: {
    backgroundColor: '#2E6B56',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    color: '#E1EEBC',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2E6B56',
  },
  levelContainer: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,107,86,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  levelText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E6B56',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(46,107,86,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E6B56',
  },
  progressText: {
    marginTop: 5,
    fontSize: 12,
    color: '#2E6B56',
    textAlign: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(46,107,86,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  coinsText: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  materialsSection: {
    backgroundColor: '#E1EEBC',
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E6B56',
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 15,
  },
  materialText: {
    fontSize: 14,
    color: '#2E6B56',
    marginTop: 5,
  },
  materialCount: {
    fontSize: 12,
    color: '#3E7A5C',
    marginTop: 2,
  },
  totalMaterials: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,107,86,0.1)',
    alignItems: 'center',
  },
  totalMaterialsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E1EEBC',
  },
  eventsSection: {
    backgroundColor: '#E1EEBC',
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(46,107,86,0.1)',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E6B56',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#3E7A5C',
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 14,
    color: '#3E7A5C',
  },
  noEventsText: {
    textAlign: 'center',
    color: '#3E7A5C',
    fontStyle: 'italic',
    marginTop: 10,
  },
}); 