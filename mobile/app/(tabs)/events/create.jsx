import { View, Text, Button, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from "../../../assets/styles/create.styles";
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import COLORS from '../../../constants/colors';
import { useAuthStore} from "../../../store/authStore"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../constants/api';

export default function CreateEventPage() {
  
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  console.log(token);
  AsyncStorage.getItem("token").then(console.log);
  console.log("Authorization Header:", JSON.stringify(`Bearer ${token}`));


  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setEventDate(formattedDate);
    }
  };

  const handleSubmit = async () => {
    if(!title || !caption || !eventDate || !location){
      Alert.alert("Error","Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          eventDate,
          location,
        }),
      });
      


      const data = await response.json();
      if(!response.ok) throw new Error(data.message || "Something went wrong");

      Alert.alert("Success", "Your event has been posted!");

      setTitle("");
      setCaption("");
      setEventDate("");
      setLocation("");

      router.push("/");

    } catch (error) {
      console.error("Error creating post:",error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally{
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      <KeyboardAvoidingView style = {{flex : 1}} behavior= {Platform.OS == "ios"  ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>

          <View style ={styles.card}>
            {/* HEADER */}
            <View style = {styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: '#326F57',
                    padding: 8,
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#E1EEBC" />
                </TouchableOpacity>
                <Text style ={styles.title}>Add Event</Text>
                <View style={{ width: 40 }} /> 
              </View>
              <Text style ={styles.subtitle}>Add Event</Text>
            </View>

            {/* Forms */}
            <View style = {styles.form}>

              {/* Event Title Form */}
              <View style = {styles.formGroup}>
                <Text style = {styles.label}>Event Title</Text>
                <View style = {styles.inputContainer}>
                  <Ionicons 
                    name="leaf-outline"
                    size={25}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter event title"
                    placeholderTextColor={COLORS.placeholderText}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>


              {/* Event Date Form */}
              <View style = {styles.formGroup}>
                <Text style = {styles.label}>Event Date</Text>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <View style = {styles.inputContainer}>
                    <Ionicons 
                      name="calendar-outline"
                      size={25}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Choose date"
                      placeholderTextColor={COLORS.placeholderText}
                      value={eventDate}
                      editable={false} // users can't input manually
                      pointerEvents="none"
                    />
                  </View>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Event Location Form */}
              <View style = {styles.formGroup}>
                <Text style = {styles.label}>Location</Text>
                <View style = {styles.inputContainer}>
                  <Ionicons 
                    name="location-outline"
                    size={25}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter event location"
                    placeholderTextColor={COLORS.placeholderText}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              {/* Caption Form */}
              <View style = {styles.formGroup}>
                <Text style = {styles.label}>Caption</Text>
                <TextInput
                  style = {styles.textArea}
                  placeholder="Explain the event details"
                  placeholderTextColor={COLORS.placeholderText}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>

              {/* Share Button */}
              <TouchableOpacity style = {styles.button} onPress={handleSubmit} 
              disabled ={loading}>
                {loading?(
                  <ActivityIndicator color = {COLORS.white}/>
                ): (
                  <>
                  <Ionicons
                    name="add-circle-outline"
                    size={25}
                    color={COLORS.white}
                    style = {styles.buttonIcon}
                  />
                  <Text style = {styles.buttonText}>Add Event</Text>
                  </>
                )}

              </TouchableOpacity>

            </View>
          </View>

        </ScrollView>
        
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
