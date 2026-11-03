import { useState } from "react";
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator,Alert,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { encode } from "base64-arraybuffer";
import { useTheme } from "../../../theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ScreenHeader";
import CircularProgress from "../../../components/CircularProgress";
import ScoreRow from "../../../components/ScoreRow";
import SuggestionCard from "../../../components/SuggestionCard";
import { auth } from "../../../firebase/firebase";

// Firebase Cloud Function URL
const ANALYZE_RESUME_URL =
    "https://australia-southeast1-portfor-u.cloudfunctions.net/analyzeResume";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ResumeAnalyzer = () => {
    const { colors, spacing, radius } = useTheme();
    const styles = createStyles(colors, spacing, radius);

    const [selectedFile, setSelectedFile] = useState(null);
    const [targetRole, setTargetRole] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Select resume file
    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size && file.size > MAX_FILE_SIZE) {
                Alert.alert(
                    "File too large",
                    "Please upload a PDF or DOCX file smaller than 8 MB."
                );
                return;
            }

            setSelectedFile(file);
            setAnalysis(null);

        } catch (error) {
            Alert.alert("Upload Error", "Unable to select your resume.");
        }
    };

    // 2. Send resume to AI API
    const handleAnalyze = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert(
                "Login Required",
                "Please log in before analyzing your resume."
            );
            return;
        }

        if (!selectedFile) {
            Alert.alert(
                "Resume Required",
                "Please upload your resume first."
            );
            return;
        }

        setLoading(true);
        setAnalysis(null);

        try {
            // Read selected file
            const fileResponse = await fetch(selectedFile.uri);
            const arrayBuffer = await fileResponse.arrayBuffer();

            if (!arrayBuffer.byteLength || arrayBuffer.byteLength > MAX_FILE_SIZE) {
                throw new Error("The file is empty or larger than 8 MB.");
            }

            // Convert file to Base64
            const fileBase64 = encode(arrayBuffer);

            // Get Firebase authentication token
            const idToken = await user.getIdToken();

            // Call Firebase Cloud Function
            const response = await fetch(ANALYZE_RESUME_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    fileBase64,
                    fileName: selectedFile.name,
                    mimeType:
                        selectedFile.mimeType ||
                        (selectedFile.name.toLowerCase().endsWith(".pdf")
                            ? "application/pdf"
                            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
                    targetRole: targetRole.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "AI analysis failed.");
            }

            // Save actual AI result
            setAnalysis(result.analysis);

            Alert.alert(
                "Analysis Complete",
                "Your resume has been successfully analyzed!"
            );

        } catch (error) {
            console.error("Resume analysis error:", error);

            Alert.alert(
                "Analysis Failed",
                error.message || "Please try again later."
            );

        } finally {
            setLoading(false);
        }
    };

    // 3. Remove selected resume
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setAnalysis(null);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenHeader
                    title="Resume Analyzer"
                    subtitle="AI-POWERED RESUME FEEDBACK"
                    bg={colors.purpleTint}
                    subtitleColor={colors.purple}
                />

                <View style={styles.body}>

                    {/* AI Upload Card */}
                    <View style={styles.uploadCard}>

                        <View style={styles.aiHeading}>
                            <View style={styles.aiIcon}>
                                <Ionicons
                                    name="sparkles"
                                    size={20}
                                    color={colors.purple}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.uploadTitle}>
                                    Analyze Your Resume with AI
                                </Text>

                                <Text style={styles.helper}>
                                    Upload your resume to receive instant feedback.
                                </Text>
                            </View>
                        </View>

                        {/* Upload Button */}
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleUpload}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={20}
                                color={colors.navy}
                            />

                            <Text style={styles.uploadButtonText}>
                                {selectedFile
                                    ? "Choose Another Resume"
                                    : "Upload Resume"}
                            </Text>
                        </TouchableOpacity>

                        {/* Selected File */}
                        {selectedFile && (
                            <View style={styles.fileRow}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={22}
                                    color={colors.success}
                                />

                                <Text
                                    style={styles.fileName}
                                    numberOfLines={1}
                                >
                                    {selectedFile.name}
                                </Text>

                                <TouchableOpacity
                                    onPress={handleRemoveFile}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={21}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Target Job */}
                        <Text style={styles.roleLabel}>
                            Target Job Title (Optional)
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Junior Software Developer"
                            placeholderTextColor={colors.textMuted}
                            value={targetRole}
                            onChangeText={setTargetRole}
                            editable={!loading}
                        />

                        <Text style={styles.helper}>
                            Enter your target job to receive more relevant
                            keyword and skills suggestions.
                        </Text>

                        {/* Analyze Button */}
                        <TouchableOpacity
                            style={[
                                styles.analyzeButton,
                                (!selectedFile || loading) &&
                                    styles.disabledButton,
                            ]}
                            onPress={handleAnalyze}
                            disabled={!selectedFile || loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Ionicons
                                    name="sparkles"
                                    size={18}
                                    color={colors.white}
                                />
                            )}

                            <Text style={styles.analyzeButtonText}>
                                {loading
                                    ? "Analyzing Resume..."
                                    : analysis
                                        ? "Analyze Again"
                                        : "Analyze My Resume"}
                            </Text>
                        </TouchableOpacity>

                        {loading && (
                            <Text style={styles.loadingText}>
                                AI is reviewing your resume. Please wait...
                            </Text>
                        )}

                        <Text style={styles.privacyNote}>
                            Your resume is securely sent to the AI analysis
                            service for processing. Please avoid uploading
                            documents containing sensitive information.
                        </Text>
                    </View>

                    {/* Actual AI Results */}
                    {analysis && (
                        <View style={styles.results}>

                            <Text style={styles.resultsHeading}>
                                Your AI Analysis
                            </Text>

                            {/* Overall Score */}
                            <CircularProgress
                                percent={Number(analysis.overallScore) || 0}
                                color={colors.purple}
                                label="RESUME SCORE"
                            />

                            {/* Summary */}
                            {!!analysis.summary && (
                                <Text style={styles.summary}>
                                    {analysis.summary}
                                </Text>
                            )}

                            {/* Score Breakdown */}
                            <View style={styles.breakdownCard}>
                                <Text style={styles.breakdownTitle}>
                                    Score Breakdown
                                </Text>

                                {(analysis.breakdown || []).map((row, index) => (
                                    <ScoreRow
                                        key={`${row.label}-${index}`}
                                        label={row.label}
                                        percent={Number(row.percent) || 0}
                                        color={colors.navy}
                                    />
                                ))}
                            </View>

                            {/* Strengths */}
                            {!!analysis.strengths?.length && (
                                <View style={styles.infoCard}>
                                    <Text style={styles.breakdownTitle}>
                                        Your Strengths
                                    </Text>

                                    {analysis.strengths.map((item, index) => (
                                        <View
                                            style={styles.bulletRow}
                                            key={index}
                                        >
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={18}
                                                color={colors.success}
                                            />

                                            <Text style={styles.bulletText}>
                                                {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Suggestions */}
                            <Text style={styles.sectionTitle}>
                                Suggestions to Improve
                            </Text>

                            {(analysis.suggestions || []).map((item, index) => (
                                <SuggestionCard
                                    key={`${item.title}-${index}`}
                                    title={
                                        item.priority
                                            ? `${item.priority}: ${item.title}`
                                            : item.title
                                    }
                                    description={item.description}
                                />
                            ))}

                            {/* Missing Sections */}
                            {!!analysis.missingSections?.length && (
                                <View style={styles.infoCard}>
                                    <Text style={styles.breakdownTitle}>
                                        Sections to Consider
                                    </Text>

                                    <Text style={styles.summary}>
                                        {analysis.missingSections.join(" • ")}
                                    </Text>
                                </View>
                            )}

                            {/* Target Role Advice */}
                            {!!analysis.targetRoleAdvice && (
                                <View style={styles.infoCard}>
                                    <Text style={styles.breakdownTitle}>
                                        Target Role Advice
                                    </Text>

                                    <Text style={styles.summary}>
                                        {analysis.targetRoleAdvice}
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.disclaimer}>
                                AI feedback is for guidance only. Please
                                review all suggestions and ensure your
                                resume remains accurate.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ResumeAnalyzer;


// Styles
const createStyles = (colors, spacing, radius) =>
    StyleSheet.create({

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

        uploadCard: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginBottom: spacing.xl,
        },

        aiHeading: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
        },

        aiIcon: {
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: colors.purpleTint,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.sm,
        },

        uploadTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800",
        },

        helper: {
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
            lineHeight: 17,
        },

        uploadButton: {
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: colors.accentBlue,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
            backgroundColor: colors.lightBlueTint,
        },

        uploadButtonText: {
            color: colors.navy,
            fontWeight: "700",
            fontSize: 14,
        },

        fileRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            padding: spacing.sm,
            backgroundColor: colors.background,
            borderRadius: radius.sm,
            marginTop: spacing.sm,
        },

        fileName: {
            color: colors.textPrimary,
            flex: 1,
            fontSize: 12,
        },

        roleLabel: {
            color: colors.textPrimary,
            fontWeight: "700",
            fontSize: 13,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
        },

        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 11,
            color: colors.textPrimary,
            fontSize: 14,
            backgroundColor: colors.background,
        },

        analyzeButton: {
            backgroundColor: colors.navy,
            borderRadius: radius.md,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
            marginTop: spacing.md,
        },

        disabledButton: {
            opacity: 0.5,
        },

        analyzeButtonText: {
            color: colors.white,
            fontSize: 14,
            fontWeight: "800",
        },

        loadingText: {
            color: colors.purple,
            fontSize: 12,
            textAlign: "center",
            marginTop: spacing.sm,
        },

        privacyNote: {
            color: colors.textMuted,
            fontSize: 10.5,
            lineHeight: 15,
            marginTop: spacing.sm,
        },

        results: {
            marginTop: spacing.sm,
        },

        resultsHeading: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "800",
            marginBottom: spacing.md,
        },

        summary: {
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            marginTop: spacing.sm,
            marginBottom: spacing.sm,
        },

        breakdownCard: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.lg,
            marginTop: spacing.lg,
            marginBottom: spacing.lg,
        },

        breakdownTitle: {
            fontSize: 15,
            fontWeight: "800",
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },

        infoCard: {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
        },

        bulletRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            marginBottom: spacing.xs,
        },

        bulletText: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
        },

        sectionTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },

        disclaimer: {
            color: colors.textMuted,
            fontSize: 11,
            lineHeight: 16,
            marginTop: spacing.md,
            marginBottom: spacing.lg,
        },
    });