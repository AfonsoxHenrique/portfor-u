import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"

import { Ionicons } from "@expo/vector-icons"

export default function DashboardLayout() {
   
    return(
    <Tabs 
        screenOptions ={{ 
            headerShown: false,
            tabBarActiveTintColor: "#3B82F6", 
            tabBarInactiveTintColor: "#494949",
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
