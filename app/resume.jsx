import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";

// Replace with data from firebase.
const MOCK_RESUME_FILE = {
    name: 'SWE_Intern_Resume.pdf',
    sizeLabel: '4.2 MB',
    updatedLabel: 'Updated 3d ago',
}

const Resumes = () => {
    const router = useRouter()
    const [title, setTitle] = useState('SWE Intern Resume - Fall 2026')
    const [targetRole, setTargetRole] = useState('Junior Software Engineer')
    const [industry, setIndustry] = useState('Technology & Software Development')

    const handleSave = () => {
        //saving resume
    }

    const handleUpload = () => {
        // upload pdf function
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ScreenHeader
                    title="My Resumes"
                    subtitle="2 FILES UPLOADED"
                    bg={colors.lightBlueTint}
                    subtitleColor={colors.accentBlue}
                    />
                    <View style={styles.body}>
                        <View style={styles.fileCard}>
                            <View style={styles.fileIconChip}>
                                <Ionicons name="document-text" size={18} color={colors.custom2} />
                            </View>
                            <View style={styles.fileTextBlock}>
                                <Text style={styles.fileName}>{MOCK_RESUME_FILE.name}</Text>
                                <Text style={styles.fileMeta}>
                                    {MOCK_RESUME_FILE.sizeLabel} • {MOCK_RESUME_FILE.updatedLabel}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
                                <Text style={styles.viewButtonText}>View</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} onPress={handleUpload}>
                            <View style={styles.uploadIconChip}>
                                <Ionicons name="cloud-upload-outline" size={20} color={colors.accentBlue} />
                            </View>
                            <Text style={styles.uploadTitle}>Upload a new version</Text>
                            <Text style={styles.uploadHint}>PDF, DOCX up to 10MB</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Resume Details</Text>

                        <Text style={styles.label}>Resume Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.label}>Target Role / Tagline</Text>
                        <TextInput
                            style={styles.input}
                            value={targetRole}
                            onChangeText={setTargetRole}
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.label}>Primary Industry</Text>
                        <TextInput
                            style={styles.input}
                            value={industry}
                            onChangeText={setIndustry}
                            placeholderTextColor={colors.textMuted}
                        />

                        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Resume Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.analyzerButton}
                            activeOpacity={0.85}
                            onPress={() => router.push('/resume-analyzer')}
                        >
                            <Text style={styles.analyzerButtonText}>Resume Analyzer</Text>
                        </TouchableOpacity>
                    </View>
                    
                </ScrollView>

                <BottomTabBar activeTab="resumes" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Resumes

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.lg,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },

    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    fileIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    fileTextBlock: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    fileMeta: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
    },
    viewButtonText: {
        fontSize: 12.5,
        fontWeight: '700',
        color: colors.accentBlue,
    },
    uploadBox: {
        borderWidth: 1.5,
        borderColor: colors.accentBlue,
        borderStyle: 'dashed',
        borderRadius: radius.md,
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginBottom: spacing.lg,
    },
    uploadIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    uploadHint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    saveButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
    analyzerButton: {
        backgroundColor: colors.custom10,
        borderWidth: 1,
        borderColor: colors.custom9,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    analyzerButtonText: {
        color: colors.custom9,
        fontSize: 15,
        fontWeight: '700',
    },
})
