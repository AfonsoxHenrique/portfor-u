import{StyleSheet, Text, View, ScrollView, TouchableOpacity} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { colors, spacing, radius } from "../theme/colors"
import {BottomTabBar} from "../components/BottomTabBar"


const Resume = () => {
    const router = useRouter();

    return(
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>My Resume</Text>
                        <Text style={styles.subtitle}>2 FILES UPLOADED</Text>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={colors.textPrimary} style={{opacity: 0}} />
                </View>

                <View style={styles.resumeFile}>
                    <View style={styles.fileIcon}><Ionicons name="document-text" size={18} color={colors.accentBlue} /></View>
                    <View style={styles.fileInfo}>
                        <Text style={styles.fileName}>SWE 2 – Resume.pdf</Text>
                        <Text style={styles.fileMeta}>2.4 MB · Updated 2d ago</Text>
                    </View>
                    <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewText}>View</Text></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.uploadBox}>
                    <Ionicons name="cloud-upload-outline" size={20} color={colors.accentBlue} />
                    <Text style={styles.uploadTitle}>Upload a new version</Text>
                    <Text style={styles.uploadMeta}>PDF, DOCX up to 10MB</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Save Resume Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/resume-analyzer')}>
                    <Ionicons name="analytics-outline" size={17} color={colors.navy} />
                    <Text style={styles.outlineButtonText}>Resume Analyzer</Text>
                </TouchableOpacity>
            </ScrollView>
            <BottomTabBar activeTab="resume" />
            </View>
        </SafeAreaView>
    );   
};
const Field = ({label, value}) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldValueWrap}>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    </View>
);

export default Resume;
