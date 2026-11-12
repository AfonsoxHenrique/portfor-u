import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ScreenHeader";
import { republishIfVisible } from "../../../services/publicProfile";
import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

import { httpsCallable } from "firebase/functions";
import { updateDoc, serverTimestamp } from "firebase/firestore";
import { functions } from "../../../firebase/firebase";

import { auth, db, storage } from "../../../firebase/firebase";
import { collection, onSnapshot, doc, deleteDoc, } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

const MOCK_CERTIFICATES = [
    {
        id: '1',
        name: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        earnedDate: 'Earned Oct 2025',
        logo: require('../../../assets/certificate-icon/aws.png'),
    },
    {
        id: '2',
        name: 'Certified ScrumMaster',
        issuer: 'Scrum Alliance',
        earnedDate: 'Earned Dec 2025',
        logo: require('../../../assets/certificate-icon/scrum.png'),
    },
    {
        id: '3',
        name: 'Google UX Design Professional',
        issuer: 'Coursera',
        earnedDate: 'Earned Feb 2026',
        logo: require('../../../assets/certificate-icon/coursera.png'),
    },
]

const Certificates = () => {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = createStyles(colors, spacing, radius);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleAdd = () => {
        router.push("/add-certificate");
    };
    
    const handleDelete = (certificateId) => {
        Alert.alert(
            "Delete Certificate",
            "Are you sure you want to delete this certificate?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;

                            if (!user) return;

                            const certificateRef = doc(
                                db,
                                "users",
                                user.uid,
                                "certificates",
                                certificateId
                            );

                            const certificate = certificates.find(
                                (item) => item.id === certificateId
                            );

                            if (certificate?.storagePath) {
                                try {
                                    await deleteObject(
                                        ref(storage, certificate.storagePath)
                                    );
                                } catch (storageError) {
                                    console.log(
                                        "Storage file could not be deleted:",
                                        storageError
                                    );
                                }
                            }

                            await deleteDoc(certificateRef);
                            republishIfVisible();
                            Alert.alert("Success", "Certificate deleted.");
                        } catch (error) {
                            console.error("Delete certificate error:", error);
                            Alert.alert("Error", "Could not delete certificate.");
                        }
                    },
                },
            ]
        );
    };  

    const handleCertPress = async (certificateId) => {

        const certificate = certificates.find(
            (item) => item.id === certificateId
        );

        if (!certificate) return;

        if (certificate.downloadURL) {
            try {
                await Linking.openURL(certificate.downloadURL);
            } catch (error) {
                console.error("Open certificate error:", error);
                Alert.alert("Error", "Could not open this certificate.");
            }
        } else if (certificate.credentialId) {
            Alert.alert(
                "Credential Information",
                certificate.credentialId
            );
        } else {
            Alert.alert(
                "No File Available",
                "This certificate does not have an uploaded file."
            );
        }
    };

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
            setCertificates([]);
            setLoading(false);
            return;
        }

        const certificatesRef = collection(
            db,
            "users",
            user.uid,
            "certificates"
        );

        const unsubscribe = onSnapshot(
            certificatesRef,
            (snapshot) => {
                const certificateList = snapshot.docs.map((document) => ({
                    id: document.id,
                    ...document.data(),
                }));

                setCertificates(certificateList);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading certificates:", error);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const getVerificationStatus = (status) => {
        switch (status) {
            case "issuer_confirmed":
                return {
                    label: "Issuer confirmed",
                    color: "#16A34A",
                    icon: "checkmark-circle",
                };
            case "revoked":
                return {
                    label: "Revoked",
                    color: colors.red,
                    icon: "close-circle",
                };
            case "verified":
                return {
                    label: "Verified",
                    color: "#16A34A",
                    icon: "checkmark-circle",
                };

            case "unconfirmed":
                return {
                    label: "Unconfirmed",
                    color: colors.amber,
                    icon: "alert-circle",
                };

            case "unsupported":
                return {
                    label: "Unsupported",
                    color: colors.textMuted,
                    icon: "help-circle",
                };

            case "not_provided":
            default:
                return {
                    label: "Not provided",
                    color: colors.textMuted,
                    icon: "remove-circle",
                };
        }
    };

    const getOwnershipStatus = (status) => {
        switch (status) {
            case "confirmed":
                return {
                    label: "Ownership confirmed",
                    color: "#16A34A",
                    icon: "checkmark-circle",
                };

            case "unconfirmed":
            default:
                return {
                    label: "Ownership unconfirmed",
                    color: colors.amber,
                    icon: "alert-circle",
                };
        }
    };

    const handleRecheck = async (cert) => {
        if (!cert.verificationURL) {
            Alert.alert("No verification link", "This certificate doesn't have a verification URL.");
            return;
        }

        try {
            const checkURL = httpsCallable(functions, "checkCertificateURL");

            const result = await checkURL({
                verificationURL: cert.verificationURL || "",
                credentialId: cert.credentialId || "",
                issuer: cert.issuer || "",
            });

            await updateDoc(
                doc(db, "users", auth.currentUser.uid, "certificates", cert.id),
                {
                    verificationStatus: result.data.verificationStatus,
                    ownershipStatus: result.data.ownershipStatus || "unconfirmed",
                    revocationStatus: result.data.revocationStatus || "unknown",
                    verificationCheckedAt: serverTimestamp(),
                    verificationMessage: result.data.message || null,
                    detectedIssuer: result.data.issuer || null,
                    verificationMethod: result.data.verificationMethod || null,
                }
            );

            Alert.alert("Check complete", result.data.message);
        } catch (error) {
            console.error("Certificate recheck error:", error);
            Alert.alert("Error", "Could not check this certificate.");
        }
    };

    return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="Certificates"
                        subtitle={`${certificates.length} EARNED BADGES`}
                        bg={colors.amberTint}
                        subtitleColor={colors.amber}
                    />

                    <View style={styles.body}>
                        <View style={styles.grid}> 
                            {certificates.map((cert) => (
                                <View key={cert.id} style={styles.certCard}>
                                    <TouchableOpacity
                                        style={styles.deleteIconBtn}
                                        onPress={() => handleDelete(cert.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash" size={14} color={colors.red} />
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleCertPress(cert.id)}>
                                        <View style={styles.logoImage}>
                                            <Ionicons
                                                name="ribbon-outline"
                                                size={28}
                                                color={colors.amber}
                                            />
                                        </View>
                                        <Text style={styles.certName}>{cert.name}</Text>
                                        <Text style={styles.certIssuer}>{cert.issuer}</Text>
                                        <Text style={styles.certDate}>{cert.earnedDate}</Text>
                                        {(() => {
                                            const status = getVerificationStatus(
                                                cert.verificationStatus
                                            );

                                            const ownership = getOwnershipStatus(
                                                cert.ownershipStatus
                                            );

                                            return (
                                                <>
                                                    <View style={styles.verificationStatus}>
                                                        <Ionicons
                                                            name={status.icon}
                                                            size={13}
                                                            color={status.color}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.verificationText,
                                                                { color: status.color },
                                                            ]}
                                                        >
                                                            Issuer: {status.label}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.verificationStatus}>
                                                        <Ionicons
                                                            name={ownership.icon}
                                                            size={13}
                                                            color={ownership.color}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.verificationText,
                                                                { color: ownership.color },
                                                            ]}
                                                        >
                                                            {ownership.label}
                                                        </Text>
                                                    </View>
                                                </>
                                            );
                                        })()}
                                        {(cert.verificationURL || cert.credentialId) && (
                                        <TouchableOpacity
                                            style={styles.recheckButton}
                                            onPress={() => handleRecheck(cert)}
                                        >
                                            <Ionicons
                                                name="refresh"
                                                size={13}
                                                color={colors.primary}
                                            />
                                            <Text style={styles.recheckButtonText}>
                                                Recheck
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Add New Badge Card */}
                            <TouchableOpacity
                                style={styles.addCard}
                                activeOpacity={0.7}
                                onPress={handleAdd}
                            >
                                <View style={styles.addIconChip}>
                                    <Ionicons name="add" size={24} color={colors.amber} />
                                </View>
                                <Text style={styles.addCardText}>Add New Badge</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Star Candidate Banner */}
                        <View style={styles.starBanner}>
                            <View style={styles.starIconChip}>
                                <Ionicons name="ribbon" size={20} color={colors.white} />
                            </View>
                            <View style={styles.starTextBlock}>
                                <Text style={styles.starTitle}>Star Candidate Status</Text>
                                <Text style={styles.starSubtitle}>
                                    Earn 1 more certificate to boost profile visibility.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

               
            </SafeAreaView>
    )
}

export default Certificates

const createStyles = (colors, spacing, radius) => StyleSheet.create({
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    certCard: {
        width: '47%',
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    logoImage: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        marginBottom: spacing.sm,
    },
    certName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 3,
    },
    certIssuer: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    certDate: {
        fontSize: 11.5,
        fontWeight: '600',
        color: colors.amber,
    },
    addCard: {
        width: '47%',
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.amber,
        borderStyle: 'dashed',
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 130,
    },
    addIconChip: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.amberTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    addCardText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.amber,
        textAlign: 'center',
    },
    starBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
    },
    starIconChip: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    starTextBlock: {
        flex: 1,
    },
    starTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 3,
    },
    starSubtitle: {
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 18,
    },
    verificationStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: spacing.sm,
    },

    verificationText: {
        fontSize: 11,
        fontWeight: "600",
    },
    deleteIconBtn: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 28,
        height: 28,
        borderRadius: radius.pill,
        backgroundColor: colors.redTint,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    recheckButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: spacing.sm,
    },

    recheckButtonText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.primary,
    },
})

