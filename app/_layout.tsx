import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { AdminProvider } from "@/app/contexts/AdminContext";
import { NotificationProvider } from "@/app/contexts/NotificationContext";
import { LoyaltyProvider } from "@/app/contexts/LoyaltyContext";
import { SoundProvider } from "@/app/contexts/SoundContext";
import { QuizProvider } from "@/app/contexts/QuizContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: Colors.textOnPrimary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="intro" options={{ headerShown: false }} />
      <Stack.Screen name="menu" options={{ headerShown: false }} />
      <Stack.Screen name="category/[slug]" options={{ 
        title: 'Menu',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="item/[id]" options={{ 
        title: 'Item Details',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin" options={{ 
        title: 'Admin Panel',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/items" options={{ 
        title: 'Manage Items',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/categories" options={{ 
        title: 'Manage Categories',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/notifications" options={{ 
        title: 'Notification Settings',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/sub-users" options={{ 
        title: 'Sub-Users Management',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/orders" options={{ 
        title: 'Orders Management',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/inventory" options={{ 
        title: 'Inventory Management',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/store-settings" options={{ 
        title: 'Store Settings',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/loyalty" options={{ 
        title: 'Loyalty Program',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/customers" options={{ 
        title: 'Customer Management',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/quiz-questions" options={{ 
        title: 'Quiz Questions',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="admin/promo-codes" options={{ 
        title: 'Promo Codes',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
      }} />
      <Stack.Screen name="quiz" options={{ 
        headerShown: false
      }} />

    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SoundProvider>
        <AdminProvider>
          <LoyaltyProvider>
            <QuizProvider>
              <NotificationProvider>
                <GestureHandlerRootView style={styles.container}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </NotificationProvider>
            </QuizProvider>
          </LoyaltyProvider>
        </AdminProvider>
      </SoundProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});