import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CarbonFootprint() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    electricity: '',
    water: '',
    gas: '',
    carDistance: '',
    publicTransport: '',
    flights: '',
    meatConsumption: '',
    waste: ''
  });

  const [result, setResult] = useState(null);

  const calculateFootprint = () => {
    // Convert all inputs to numbers and calculate total
    const total = Object.values(formData).reduce((sum, value) => {
      const numValue = parseFloat(value) || 0;
      return sum + numValue;
    }, 0);

    // Calculate CO2 equivalent (this is a simplified calculation)
    const co2Equivalent = total * 0.5; // Example conversion factor

    setResult({
      total,
      co2Equivalent,
      category: co2Equivalent < 1000 ? 'Low' : co2Equivalent < 2000 ? 'Medium' : 'High'
    });
  };

  const renderInput = (label, key, icon) => (
    <View style={styles.inputContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#2E6B56" />
      <TextInput
        style={styles.input}
        placeholder={label}
        keyboardType="numeric"
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        placeholderTextColor="#666"
      />
    </View>
  );

  return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#E1EEBC" />
          </TouchableOpacity>
          <Text style={styles.title}>Carbon Footprint Calculator</Text>
        </View>

        <View style={styles.formContainer}>
          {renderInput('Monthly Electricity (kWh)', 'electricity', 'lightning-bolt')}
          {renderInput('Monthly Water (m³)', 'water', 'water')}
          {renderInput('Monthly Gas (m³)', 'gas', 'fire')}
          {renderInput('Car Distance (km/month)', 'carDistance', 'car')}
          {renderInput('Public Transport (km/month)', 'publicTransport', 'bus')}
          {renderInput('Flights (km/year)', 'flights', 'airplane')}
          {renderInput('Meat Consumption (kg/month)', 'meatConsumption', 'food')}
          {renderInput('Waste (kg/month)', 'waste', 'trash-can')}

          <TouchableOpacity style={styles.calculateButton} onPress={calculateFootprint}>
            <Text style={styles.calculateButtonText}>Calculate Footprint</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Your Carbon Footprint</Text>
              <Text style={styles.resultValue}>{result.co2Equivalent.toFixed(2)} kg CO2e</Text>
              <Text style={styles.resultCategory}>Category: {result.category}</Text>
              
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips to Reduce Your Footprint:</Text>
                <Text style={styles.tip}>• Use energy-efficient appliances</Text>
                <Text style={styles.tip}>• Reduce meat consumption</Text>
                <Text style={styles.tip}>• Use public transport more often</Text>
                <Text style={styles.tip}>• Reduce water usage</Text>
              </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1EEBC',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2E6B56',
  },
  calculateButton: {
    backgroundColor: '#2E6B56',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#E1EEBC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#E1EEBC',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    color: '#2E6B56',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 32,
    color: '#2E6B56',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  resultCategory: {
    fontSize: 18,
    color: '#2E6B56',
    textAlign: 'center',
    marginBottom: 15,
  },
  tipsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2E6B56',
    paddingTop: 15,
  },
  tipsTitle: {
    fontSize: 16,
    color: '#2E6B56',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#2E6B56',
    marginBottom: 5,
  },
}); 