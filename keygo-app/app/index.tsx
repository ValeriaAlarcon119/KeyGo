import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const { user } = useAuth();
  const [activeDot, setActiveDot] = useState(0);
  
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Dot sequence: 0 -> 1 -> 2 -> 3
    const dotInterval = setInterval(() => {
      setActiveDot(prev => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    // Navigate to appropriate screen after 5 seconds
    const timer = setTimeout(() => {
      if (user) {
        switch (user.role) {
          case 'OWNER': router.replace('/(owner)/dashboard'); break;
          case 'STORE': router.replace('/(store)/dashboard'); break;
          case 'ADMIN': router.replace('/(admin)/dashboard'); break;
          default: router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(dotInterval);
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.centerContent}>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        {[0, 1, 2, 3].map((i) => (
          <View 
            key={i} 
            style={[styles.dot, activeDot === i && styles.dotActive]} 
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 340,
    height: 240,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  dotActive: {
    backgroundColor: '#F4C430',
    transform: [{ scale: 1.2 }],
  },
});
