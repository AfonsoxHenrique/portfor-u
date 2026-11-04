import { Redirect, Tabs } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthUser } from "../../hooks/useAuthUser";
import {useTheme } from "../../theme/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardLayout() {
    const { user, initializing } = useAuthUser()
    const { colors, isDark } = useTheme()
    const insets = useSafeAreaInsets()

    if (initializing) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        )
    }

    if (!user) return <Redirect href="/" />
    if (!user.emailVerified) return <Redirect href="/verify-email" />
   
    return(
    <Tabs 
        screenOptions ={{ 
            headerShown: false,
            tabBarStyle:{
                backgroundColor: colors.surface,
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom,
                borderTopColor: colors.border,
            },
            tabBarActiveTintColor: "#3B82F6", 
            tabBarInactiveTintColor: isDark ? "#FFFFFF" : "#494949",
        }}
    >

        {/* For Home */}
        <Tabs.Screen
            name="home"
            options={{title: "Home", tabBarIcon: ({ focused, color }) => (
                <Ionicons
                    size={24}
                    color={color}
                    name={focused ? 'home' : 'home-outline'}
                />
            )}}
        />

        {/* For Resume */}
        <Tabs.Screen
            name="(resume)"
            options={{title: "Resume", tabBarIcon: ({ focused, color }) => (
                <Ionicons
                    size={24}
                    color={color}
                    name={focused ? 'document-text' : 'document-text-outline'}
                />
            )}}
        />

        {/* For Work Experience */}
        <Tabs.Screen
            name="(work-experience)"
            options={{title: "Experience", tabBarIcon: ({ focused, color }) => (
                <Ionicons
                    size={24}
                    color={color}
                    name={focused ? 'briefcase' : 'briefcase-outline'}
                />
            )}}
        />

        {/* For Certificates */}
        <Tabs.Screen
            name="(certificates)"
            options={{title: "Certificates", tabBarIcon: ({ focused, color }) => (
                <Ionicons
                    size={24}
                    color={color}
                    name={focused ? 'ribbon' : 'ribbon-outline'}
                />
            )}}
        />

        {/* For Profile */}
        <Tabs.Screen
            name="(profile)"
            options={{title: "Profile", tabBarIcon: ({ focused, color }) => (
                <Ionicons
                    size={24}
                    color={color}
                    name={focused ? 'person' : 'person-outline'}
                />
            )}}
        />

        {/* Hiding Guideline Page */}
        <Tabs.Screen
            name="guideline"
            options={{ href: null }}
        />
    </Tabs>
    )
    
}
