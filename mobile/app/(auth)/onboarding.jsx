import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Yesil Adimlar',
    description: 'Every small step you take shapes the future of our world. Reduce your environmental impact with sustainable living habits and show your love for nature.',
    image: require('../../assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Discover Your Carbon Footprint',
    description: 'Learn about the environmental impact of your daily activities, calculate your carbon footprint, and get recommendations for a more sustainable life. Think about nature with every step!',
    image: require('../../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Become a Green Hero',
    description: 'Recycle, earn points, and get your rewards! Protect nature and reward yourself with eco-friendly behaviors. Join the green heroes!',
    image: require('../../assets/images/onboarding3.png'),
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await setHasSeenOnboarding();
      router.replace('/(auth)');
    }
  };

  const skipOnboarding = async () => {
    await setHasSeenOnboarding();
    router.replace('/(auth)');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
      </View>
    );
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
              key={index.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#F6F8ED', '#E1EEBC']} style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <Pagination />

      <TouchableOpacity style={styles.button} onPress={scrollTo}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Start' : 'Continue'}
        </Text>
        <Ionicons name="arrow-forward" size={24} color={'#fff'} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8ED',
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#2E6B56',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height,
    marginTop: 100,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E6B56',
    textAlign: 'center',
    marginBottom: 18,
  },
  description: {
    fontSize: 16,
    color: '#3E7A5C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT * 0.40,
    marginTop: 0,
    borderRadius: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E6B56',
    marginHorizontal: 5,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2E6B56',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
}); 