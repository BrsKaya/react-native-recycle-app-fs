import React from 'react';
import {View,Text,Image,ImageBackground,StatusBar,StyleSheet} from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';


const TabIcon = ({ focused, icon, title }) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        style={styles.highlightedTab}
        imageStyle={styles.imageBackgroundRounded}
      >
        <Image source={icon} style={[styles.icon, { tintColor: '#fff8ed' }]} />
        <Text style={styles.highlightedText}>{title}</Text>
      </ImageBackground>
    );
  }

  return (
    
    <View style={styles.defaultTab}>
      <Image source={icon} style={[styles.icon, { tintColor: '#fff8ed' }]} />
    </View>
  );
};

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
      <Tabs
        screenOptions={{
          headerShown:false,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarStyle: {
            position: 'absolute',
            overflow: 'hidden',
            borderTopWidth: 0,
            marginBottom: 36,
            borderRadius: 50,
            marginHorizontal: 20,
            height: 53 + insets.bottom,
            paddingBottom : insets.bottom,
            backgroundColor: '#2E6B56',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.home} title="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.search} title="Scan" />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.save} title="Events" />
            ),
            listeners: {
              tabPress: (e) => {
                e.preventDefault();
                router.push('/events/index');
              },
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused ={focused} icon={icons.person} title="Profile" />
            ),
          }}
        />
      </Tabs>
    
  );
};

const styles = StyleSheet.create({
  highlightedTab: {
    flexDirection: 'row',
    minWidth: 112,
    minHeight: 64,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999, // rounded-full
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  imageBackgroundRounded: {
    borderRadius: 999,
  },
  highlightedText: {
    color: '#fff8ed',
    fontSize: 16,
    marginLeft: 8,
  },
  defaultTab: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 999,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default TabLayout;
