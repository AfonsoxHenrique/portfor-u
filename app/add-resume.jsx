import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import UploadBox from "../components/UploadBox";

const AddResume = () => {
    const router = useRouter()
    const { id } = useLocalSearchParams()
    const isEditing = !!id

    const [title, setTitle] = useState('')
    const [targetRole, setTargetRole] = useState('')
    const [industry, setIndustry] = useState('')

    const handleChooseFile = () => {
        // Wire this up to expo-document-picker to let the user pick a PDF/DOCX.
    }

    const handleSave = () => {
        // Wire this up to your resume upload/save API call.
        router.back()
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ScreenHeader
                        title={isEditing ? 'Edit Resume' : 'Add Resume'}
                        subtitle={isEditing ? 'UPDATE YOUR RESUME' : 'UPLOAD YOUR RESUME'}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        <UploadBox
                            label="Resume file"
                            title="Choose a resume to upload"
                            hint="PDF or DOCX - Max 10MB"
                            onChooseFile={handleChooseFile}
                        />

                        <Text style={styles.label}>Resume Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. SWE Intern Resume - Fall 2026"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Target Role / Tagline</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Junior Software Engineer"
                            placeholderTextColor={colors.textMuted}
                            value={targetRole}
                            onChangeText={setTargetRole}
                        />

                        <Text style={styles.label}>Primary Industry</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Technology & Software"
                            placeholderTextColor={colors.textMuted}
                            value={industry}
                            onChangeText={setIndustry}
                        />

                        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>
                                {isEditing ? 'Save Changes' : 'Add Resume'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AddResume

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
})
