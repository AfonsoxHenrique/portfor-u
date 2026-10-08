import{StyleSheet, Text, View, ScrollView, TouchableOpacity} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import {BottomTabBar} from "../components/BottomTabBar"

<View style={styles.header}>
    <View style={styles.back}>
        <Ionicons name="chevron-back" size={15} color={colors.textPrimary}/></View><View>
            <Text style={styles.title}>Resume Analyzer</Text>
            <Text style={styles.meta}>INSTANT RESUME FEEDBACK SCORE</Text>
    </View>
</View>
