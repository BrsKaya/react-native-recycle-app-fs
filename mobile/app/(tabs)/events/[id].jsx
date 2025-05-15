import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../../constants/api';
import { useAuthStore } from '../../../store/authStore';
import { Image } from 'expo-image';
import styles from '../../../assets/styles/home.styles';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    title: '',
    caption: '',
    eventDate: '',
    location: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        throw new Error('Event ID is missing');
      }

      if (!token) {
        throw new Error('Authentication token is missing');
      }

      console.log('Fetching event details for ID:', id);
      console.log('API URL:', `${API_URL}/events/${id}`);

      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the response status and headers for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      console.log('Received event data:', data);
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event details:', err);
      if (err.message.includes('non-JSON response')) {
        setError('Server error: Please try again later');
      } else {
        setError(err.message || 'Failed to fetch event details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      setJoining(true);
      
      const response = await fetch(`${API_URL}/events/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join event');
      }

      setEvent(data);
      Alert.alert('Success', 'You have joined the event!');
    } catch (err) {
      console.error('Error joining event:', err);
      Alert.alert('Error', err.message || 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setJoining(true);
      
      const response = await fetch(`${API_URL}/events/${id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave event');
      }

      setEvent(data);
      Alert.alert('Success', 'You have left the event');
    } catch (err) {
      console.error('Error leaving event:', err);
      Alert.alert('Error', err.message || 'Failed to leave event');
    } finally {
      setJoining(false);
    }
  };

  const handleEdit = () => {
    setEditedEvent({
      title: event.title,
      caption: event.caption,
      eventDate: event.eventDate,
      location: event.location
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedEvent)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }

      setEvent(data);
      setIsEditing(false);
      Alert.alert('Success', 'Event updated successfully!');
    } catch (err) {
      console.error('Error updating event:', err);
      Alert.alert('Error', err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete event');
              }

              Alert.alert('Success', 'Event deleted successfully!');
              router.back();
            } catch (err) {
              console.error('Error deleting event:', err);
              Alert.alert('Error', err.message || 'Failed to delete event');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEditedEvent(prev => ({ ...prev, eventDate: formattedDate }));
    }
  };

  const isParticipant = event?.participants?.some(
    participant => participant._id === user?._id
  );

  if (loading) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E1EEBC" />
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#E1EEBC', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity
            onPress={fetchEventDetails}
            style={{
              backgroundColor: '#E1EEBC',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20
            }}
          >
            <Text style={{ color: '#2E6B56', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!event) {
    return (
      <LinearGradient colors={['#2E6B56', '#90C67C']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#E1EEBC', borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' }}>
            <Ionicons name="alert-circle-outline" size={48} color="#2E6B56" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, color: '#2E6B56', textAlign: 'center' }}>
              Event not found
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const isEventCreator = event?.user?._id === user?._id;

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header with back button */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Ionicons name="arrow-back" size={24} color="#E1EEBC" />
            </TouchableOpacity>
            {isEventCreator && !isEditing && (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={handleEdit}
                  style={{ marginRight: 16 }}
                >
                  <Ionicons name="create-outline" size={24} color="#E1EEBC" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={24} color="#E1EEBC" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Event Card */}
          <View style={{ backgroundColor: '#E1EEBC', borderRadius: 24, padding: 28, width: '100%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
            {/* User Info */}
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              onPress={() => router.push(`/user/${event.user._id}`)}
            >
              {event.user?.profileImage ? (
                <Image 
                  source={{ uri: event.user.profileImage }} 
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: 'rgba(46,107,86,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#2E6B56', fontWeight: 'bold', fontSize: 22 }}>
                    {event.user?.username?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16, color: '#2E6B56', fontWeight: 'bold' }}>
                  {event.user?.username || 'User'}
                </Text>
                <Text style={{ fontSize: 13, color: '#3E7A5C' }}>
                  {new Date(event.createdAt).toLocaleDateString('en-US')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Event Title and Join Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              {isEditing ? (
                <TextInput
                  style={{ 
                    fontSize: 26, 
                    color: '#2E6B56', 
                    fontWeight: 'bold', 
                    fontFamily: 'serif', 
                    flex: 1,
                    backgroundColor: 'rgba(46,107,86,0.1)',
                    padding: 8,
                    borderRadius: 8
                  }}
                  value={editedEvent.title}
                  onChangeText={(text) => setEditedEvent(prev => ({ ...prev, title: text }))}
                  placeholder="Event Title"
                  placeholderTextColor="#3E7A5C"
                />
              ) : (
                <Text style={{ fontSize: 26, color: '#2E6B56', fontWeight: 'bold', fontFamily: 'serif', flex: 1 }}>
                  {event.title}
                </Text>
              )}
              {!isEditing && (
                <TouchableOpacity
                  onPress={isParticipant ? handleLeaveEvent : handleJoinEvent}
                  disabled={joining}
                  style={{
                    backgroundColor: isParticipant ? '#ff6b6b' : '#2E6B56',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginLeft: 12
                  }}
                >
                  {joining ? (
                    <ActivityIndicator size="small" color="#E1EEBC" />
                  ) : (
                    <Text style={{ color: '#E1EEBC', fontWeight: 'bold' }}>
                      {isParticipant ? 'Leave' : 'Join'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Event Description */}
            {isEditing ? (
              <TextInput
                style={{ 
                  fontSize: 15, 
                  color: '#3E7A5C', 
                  marginBottom: 24, 
                  lineHeight: 22,
                  backgroundColor: 'rgba(46,107,86,0.1)',
                  padding: 8,
                  borderRadius: 8,
                  minHeight: 100,
                  textAlignVertical: 'top'
                }}
                value={editedEvent.caption}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, caption: text }))}
                placeholder="Event Description"
                placeholderTextColor="#3E7A5C"
                multiline
              />
            ) : (
              <Text style={{ fontSize: 15, color: '#3E7A5C', marginBottom: 24, lineHeight: 22 }}>
                {event.caption}
              </Text>
            )}

            {/* Event Details */}
            <View style={{ backgroundColor: 'rgba(46,107,86,0.1)', borderRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="calendar-outline" size={20} color="#2E6B56" style={{ marginRight: 8 }} />
                {isEditing ? (
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={{ fontSize: 15, color: '#2E6B56' }}>
                      {editedEvent.eventDate || 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ fontSize: 15, color: '#2E6B56' }}>
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={20} color="#2E6B56" style={{ marginRight: 8 }} />
                {isEditing ? (
                  <TextInput
                    style={{ 
                      fontSize: 15, 
                      color: '#2E6B56',
                      flex: 1,
                      backgroundColor: 'rgba(46,107,86,0.1)',
                      padding: 8,
                      borderRadius: 8
                    }}
                    value={editedEvent.location}
                    onChangeText={(text) => setEditedEvent(prev => ({ ...prev, location: text }))}
                    placeholder="Event Location"
                    placeholderTextColor="#3E7A5C"
                  />
                ) : (
                  <Text style={{ fontSize: 15, color: '#2E6B56' }}>
                    {event.location}
                  </Text>
                )}
              </View>
            </View>

            {isEditing && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={{
                    backgroundColor: '#ff6b6b',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 12
                  }}
                >
                  <Text style={{ color: '#E1EEBC', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    backgroundColor: '#2E6B56',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20
                  }}
                >
                  <Text style={{ color: '#E1EEBC', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={new Date(editedEvent.eventDate || Date.now())}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            {/* Participants List */}
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 16, color: '#2E6B56', fontWeight: 'bold', marginBottom: 12 }}>
                Participants ({event.participants?.length || 0})
              </Text>
              {event.participants && event.participants.length > 0 ? (
                event.participants.map((participant) => {
                  // Validate participant data
                  if (!participant || !participant._id) {
                    console.log('Invalid participant data:', participant);
                    return null;
                  }

                  return (
                    <TouchableOpacity 
                      key={participant._id} 
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => router.push(`/user/${participant._id}`)}
                    >
                      {participant.profileImage ? (
                        <Image 
                          source={{ uri: participant.profileImage }} 
                          style={[styles.avatar, { width: 30, height: 30 }]}
                          contentFit="cover"
                          transition={200}
                          onError={(e) => {
                            console.log('Error loading profile image for user:', participant.username, e);
                          }}
                        />
                      ) : (
                        <View style={[styles.avatar, { width: 30, height: 30, backgroundColor: 'rgba(46,107,86,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ color: '#2E6B56', fontWeight: 'bold', fontSize: 14 }}>
                            {participant.username?.[0]?.toUpperCase() || '?'}
                          </Text>
                        </View>
                      )}
                      <Text style={{ marginLeft: 8, color: '#3E7A5C', fontSize: 14 }}>
                        {participant.username || 'Anonymous User'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: '#3E7A5C', fontStyle: 'italic' }}>
                  No participants yet
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
