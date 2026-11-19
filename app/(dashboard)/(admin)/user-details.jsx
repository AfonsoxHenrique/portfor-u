
import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    TextInput,
    Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

import { db, storage, functions } from "../../../firebase/firebase";
import { useTheme } from "../../../theme/ThemeContext";
import MonthYearField from "../../../components/form/MonthYearField";

export default function UserDetails() {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Personal information
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [saving, setSaving] = useState(false);

    // Resumes
    const [resumes, setResumes] = useState([]);
    const [resumesLoading, setResumesLoading] = useState(true);
    const [editingResumeId, setEditingResumeId] = useState(null);
    const [resumeTitle, setResumeTitle] = useState("");
    const [resumeTargetRole, setResumeTargetRole] = useState("");
    const [resumeIndustry, setResumeIndustry] = useState("");
    const [savingResume, setSavingResume] = useState(false);

    // Work experience
    const [workExperiences, setWorkExperiences] = useState([]);
    const [workLoading, setWorkLoading] = useState(true);
    const [editingWorkId, setEditingWorkId] = useState(null);
    const [workJobTitle, setWorkJobTitle] = useState("");
    const [workCompany, setWorkCompany] = useState("");
    const [workLocation, setWorkLocation] = useState("");
    const [workStartDate, setWorkStartDate] = useState(null);
    const [workEndDate, setWorkEndDate] = useState(null);
    const [workCurrentlyWorking, setWorkCurrentlyWorking] = useState(false);
    const [workArrangement, setWorkArrangement] = useState("On-site");
    const [workDescription, setWorkDescription] = useState("");
    const [savingWork, setSavingWork] = useState(false);

    // Add Work Experience
    const [addingWork, setAddingWork] = useState(false);
    const [newWorkJobTitle, setNewWorkJobTitle] = useState("");
    const [newWorkCompany, setNewWorkCompany] = useState("");
    const [newWorkLocation, setNewWorkLocation] = useState("");
    const [newWorkStartDate, setNewWorkStartDate] = useState(null);
    const [newWorkEndDate, setNewWorkEndDate] = useState(null);
    const [newWorkCurrentlyWorking, setNewWorkCurrentlyWorking] = useState(false);
    const [newWorkArrangement, setNewWorkArrangement] = useState("On-site");
    const [newWorkDescription, setNewWorkDescription] = useState("");
    const [savingNewWork, setSavingNewWork] = useState(false);

    // Education
    const [educationEntries, setEducationEntries] = useState([]);
    const [educationLoading, setEducationLoading] = useState(true);

    const [editingEducationId, setEditingEducationId] = useState(null);
    const [educationInstitution, setEducationInstitution] = useState("");
    const [educationQualification, setEducationQualification] = useState("");
    const [educationFieldOfStudy, setEducationFieldOfStudy] = useState("");
    const [educationStartDate, setEducationStartDate] = useState(null);
    const [educationEndDate, setEducationEndDate] = useState(null);
    const [educationCurrentlyStudying, setEducationCurrentlyStudying] = useState(false);
    const [educationDescription, setEducationDescription] = useState("");
    const [savingEducation, setSavingEducation] = useState(false);

    // Add Education
    const [addingEducation, setAddingEducation] = useState(false);
    const [newEducationInstitution, setNewEducationInstitution] = useState("");
    const [newEducationQualification, setNewEducationQualification] = useState("");
    const [newEducationFieldOfStudy, setNewEducationFieldOfStudy] = useState("");
    const [newEducationStartDate, setNewEducationStartDate] = useState(null);
    const [newEducationEndDate, setNewEducationEndDate] = useState(null);
    const [newEducationCurrentlyStudying, setNewEducationCurrentlyStudying] = useState(false);
    const [newEducationDescription, setNewEducationDescription] = useState("");
    const [savingNewEducation, setSavingNewEducation] = useState(false);

    // Certificates
    const [certificates, setCertificates] = useState([]);
    const [certificatesLoading, setCertificatesLoading] = useState(true);

    const [addingCertificate, setAddingCertificate] = useState(false);
    const [newCertName, setNewCertName] = useState("");
    const [newCertIssuer, setNewCertIssuer] = useState("");
    const [newCertDate, setNewCertDate] = useState("");
    const [newCertCredentialId, setNewCertCredentialId] = useState("");
    const [newCertVerificationURL, setNewCertVerificationURL] = useState("");
    const [newCertFile, setNewCertFile] = useState(null);
    const [savingNewCertificate, setSavingNewCertificate] = useState(false);

    const [editingCertificateId, setEditingCertificateId] = useState(null);
    const [certName, setCertName] = useState("");
    const [certIssuer, setCertIssuer] = useState("");
    const [certDate, setCertDate] = useState("");
    const [certCredentialId, setCertCredentialId] = useState("");
    const [certVerificationURL, setCertVerificationURL] = useState("");
    const [savingCertificate, setSavingCertificate] = useState(false);
    const [recheckingCertificateId, setRecheckingCertificateId] = useState(null);

    // Load selected user
    useEffect(() => {
        if (!userId) return;

        const userRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(
            userRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setUserData(snapshot.data());
                    setFirstName(snapshot.data().firstName || "");
                    setLastName(snapshot.data().lastName || "");
                } else {
                    setUserData(null);
                }

                setLoading(false);
            },
            (error) => {
                console.error("Error loading user:", error);
                Alert.alert("Error", "Could not load user information.");
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Load resumes
    useEffect(() => {
        if (!userId) return;

        const resumesRef = collection(db, "users", userId, "resumes");

        const unsubscribe = onSnapshot(
            resumesRef,
            (snapshot) => {
                setResumes(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
                setResumesLoading(false);
            },
            (error) => {
                console.error("Error loading user resumes:", error);
                setResumesLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Load work experience
    useEffect(() => {
        if (!userId) return;

        const experienceRef = collection(db, "users", userId, "workExperience");

        const unsubscribe = onSnapshot(
            experienceRef,
            (snapshot) => {
                setWorkExperiences(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
                setWorkLoading(false);
            },
            (error) => {
                console.error("Error loading work experience:", error);
                setWorkLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Load education
    useEffect(() => {
        if (!userId) return;

        const educationRef = collection(db, "users", userId, "education");

        const unsubscribe = onSnapshot(
            educationRef,
            (snapshot) => {
                setEducationEntries(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
                setEducationLoading(false);
            },
            (error) => {
                console.error("Error loading education:", error);
                setEducationLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Load certificates
    useEffect(() => {
        if (!userId) return;

        const certificatesRef = collection(db, "users", userId, "certificates");

        const unsubscribe = onSnapshot(
            certificatesRef,
            (snapshot) => {
                setCertificates(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
                setCertificatesLoading(false);
            },
            (error) => {
                console.error("Error loading certificates:", error);
                setCertificatesLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Save personal information
    const handleSave = async () => {
        if (!userId) return;

        try {
            setSaving(true);

            await updateDoc(doc(db, "users", userId), {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            setEditing(false);
            Alert.alert("Success", "User information updated.");
        } catch (error) {
            console.error("Error updating user:", error);
            Alert.alert("Error", "Could not update user information.");
        } finally {
            setSaving(false);
        }
    };

    // Save Resume
    const handleSaveResume = async () => {
        if (!userId || !editingResumeId) return;

        if (!resumeTitle.trim()) {
            Alert.alert("Missing information", "Please enter a resume title.");
            return;
        }

        try {
            setSavingResume(true);

            await updateDoc(
                doc(db, "users", userId, "resumes", editingResumeId),
                {
                    title: resumeTitle.trim(),
                    targetRole: resumeTargetRole.trim(),
                    industry: resumeIndustry.trim(),
                    updatedAt: new Date(),
                }
            );

            setEditingResumeId(null);
            Alert.alert("Success", "Resume updated successfully.");
        } catch (error) {
            console.error("Error updating resume:", error);
            Alert.alert("Error", "Could not update this resume.");
        } finally {
            setSavingResume(false);
        }
    };

    // Save Work Experience
    const handleSaveWork = async () => {
        if (!userId || !editingWorkId) return;

        if (!workJobTitle.trim() || !workCompany.trim()) {
            Alert.alert("Missing information", "Job title and company are required.");
            return;
        }

        if (
            workStartDate &&
            workEndDate &&
            !workCurrentlyWorking &&
            workEndDate < workStartDate
        ) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        try {
            setSavingWork(true);

            await updateDoc(
                doc(db, "users", userId, "workExperience", editingWorkId),
                {
                    jobTitle: workJobTitle.trim(),
                    company: workCompany.trim(),
                    location: workLocation.trim(),
                    startDate: workStartDate || null,
                    endDate: workCurrentlyWorking ? null : workEndDate || null,
                    currentlyWorkHere: workCurrentlyWorking,
                    workArrangement,
                    description: workDescription.trim(),
                    updatedAt: new Date(),
                }
            );

            setEditingWorkId(null);
            Alert.alert("Success", "Work experience updated.");
        } catch (error) {
            console.error("Error updating work experience:", error);
            Alert.alert("Error", "Could not update work experience.");
        } finally {
            setSavingWork(false);
        }
    };

    // Delete Work Experience
    const handleDeleteWork = (experienceId) => {
        Alert.alert(
            "Delete Work Experience",
            "Are you sure you want to delete this entry? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(
                                doc(db, "users", userId, "workExperience", experienceId)
                            );
                            Alert.alert("Success", "Work experience deleted successfully.");
                        } catch (error) {
                            console.error("Error deleting work experience:", error);
                            Alert.alert("Error", "Could not delete work experience.");
                        }
                    },
                },
            ]
        );
    };

    // Add Work Experience
    const handleAddWork = async () => {
        if (!userId) return;

        if (!newWorkJobTitle.trim() || !newWorkCompany.trim()) {
            Alert.alert("Missing information", "Job title and company are required.");
            return;
        }

        if (
            newWorkStartDate &&
            newWorkEndDate &&
            !newWorkCurrentlyWorking &&
            newWorkEndDate < newWorkStartDate
        ) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        try {
            setSavingNewWork(true);

            await addDoc(collection(db, "users", userId, "workExperience"), {
                jobTitle: newWorkJobTitle.trim(),
                company: newWorkCompany.trim(),
                location: newWorkLocation.trim(),
                startDate: newWorkStartDate || null,
                endDate: newWorkCurrentlyWorking ? null : newWorkEndDate || null,
                currentlyWorkHere: newWorkCurrentlyWorking,
                workArrangement: newWorkArrangement,
                description: newWorkDescription.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setNewWorkJobTitle("");
            setNewWorkCompany("");
            setNewWorkLocation("");
            setNewWorkStartDate(null);
            setNewWorkEndDate(null);
            setNewWorkCurrentlyWorking(false);
            setNewWorkArrangement("On-site");
            setNewWorkDescription("");
            setAddingWork(false);

            Alert.alert("Success", "Work experience added successfully.");
        } catch (error) {
            console.error("Error adding work experience:", error);
            Alert.alert("Error", "Could not add work experience.");
        } finally {
            setSavingNewWork(false);
        }
    };

    // Save Education
    const handleSaveEducation = async () => {
        if (!userId || !editingEducationId) return;

        if (!educationInstitution.trim() || !educationQualification.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter at least an institution and qualification."
            );
            return;
        }

        if (educationStartDate && !educationCurrentlyStudying && !educationEndDate) {
            Alert.alert(
                "Missing end date",
                'Add an end date, or tick "I am currently studying here".'
            );
            return;
        }

        if (
            educationStartDate &&
            educationEndDate &&
            !educationCurrentlyStudying &&
            educationEndDate < educationStartDate
        ) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        try {
            setSavingEducation(true);

            await updateDoc(
                doc(db, "users", userId, "education", editingEducationId),
                {
                    institution: educationInstitution.trim(),
                    qualification: educationQualification.trim(),
                    fieldOfStudy: educationFieldOfStudy.trim(),
                    startDate: educationStartDate ?? null,
                    endDate: educationCurrentlyStudying ? null : educationEndDate ?? null,
                    currentlyStudying: educationCurrentlyStudying,
                    description: educationDescription.trim(),
                    updatedAt: serverTimestamp(),
                }
            );

            setEditingEducationId(null);
            Alert.alert("Success", "Education updated successfully.");
        } catch (error) {
            console.error("Error updating education:", error);
            Alert.alert("Error", "Could not update this education entry.");
        } finally {
            setSavingEducation(false);
        }
    };

    // Add Education
    const handleAddEducation = async () => {
        if (!userId) return;

        if (!newEducationInstitution.trim() || !newEducationQualification.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter at least an institution and qualification."
            );
            return;
        }

        if (
            newEducationStartDate &&
            !newEducationCurrentlyStudying &&
            !newEducationEndDate
        ) {
            Alert.alert(
                "Missing end date",
                'Add an end date, or tick "I am currently studying here".'
            );
            return;
        }

        if (
            newEducationStartDate &&
            newEducationEndDate &&
            !newEducationCurrentlyStudying &&
            newEducationEndDate < newEducationStartDate
        ) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        try {
            setSavingNewEducation(true);

            await addDoc(collection(db, "users", userId, "education"), {
                institution: newEducationInstitution.trim(),
                qualification: newEducationQualification.trim(),
                fieldOfStudy: newEducationFieldOfStudy.trim(),
                startDate: newEducationStartDate ?? null,
                endDate: newEducationCurrentlyStudying ? null : newEducationEndDate ?? null,
                currentlyStudying: newEducationCurrentlyStudying,
                description: newEducationDescription.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setNewEducationInstitution("");
            setNewEducationQualification("");
            setNewEducationFieldOfStudy("");
            setNewEducationStartDate(null);
            setNewEducationEndDate(null);
            setNewEducationCurrentlyStudying(false);
            setNewEducationDescription("");
            setAddingEducation(false);

            Alert.alert("Success", "Education added successfully.");
        } catch (error) {
            console.error("Error adding education:", error);
            Alert.alert("Error", "Could not add this education entry.");
        } finally {
            setSavingNewEducation(false);
        }
    };

    // Delete Education
    const handleDeleteEducation = (educationId) => {
        Alert.alert(
            "Delete Education",
            "Are you sure you want to delete this education entry? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(
                                doc(db, "users", userId, "education", educationId)
                            );
                            Alert.alert("Success", "Education deleted successfully.");
                        } catch (error) {
                            console.error("Error deleting education:", error);
                            Alert.alert("Error", "Could not delete this education entry.");
                        }
                    },
                },
            ]
        );
    };

    // Certificate verification helper
    const checkCertificateURL = async ({ verificationURL, credentialId, issuer }) => {
        if (!verificationURL && !credentialId) {
            return {
                verificationStatus: "not_provided",
                ownershipStatus: "unconfirmed",
                revocationStatus: "unknown",
                message: null,
            };
        }

        try {
            const checkURL = httpsCallable(functions, "checkCertificateURL");

            const result = await checkURL({
                verificationURL: verificationURL || "",
                credentialId: credentialId || "",
                issuer: issuer || "",
            });

            return result.data;
        } catch (error) {
            console.error("Certificate verification error:", error);

            return {
                verificationStatus: "unconfirmed",
                ownershipStatus: "unconfirmed",
                revocationStatus: "unknown",
                message: "Could not check this certificate.",
            };
        }
    };

    // Validate certificate URL
    const isValidVerificationURL = (url) => {
        if (!url.trim()) return true;

        try {
            return new URL(url.trim()).protocol === "https:";
        } catch {
            return false;
        }
    };

    // Select certificate file
    const handleChooseCertificateFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/png", "image/jpeg"],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const selectedFile = result.assets[0];

            if (selectedFile.size && selectedFile.size > 10 * 1024 * 1024) {
                Alert.alert("File too large", "Please choose a file smaller than 10 MB.");
                return;
            }

            setNewCertFile(selectedFile);
        } catch (error) {
            console.error("File selection error:", error);
            Alert.alert("Error", "Could not select certificate file.");
        }
    };

    // Add Certificate
    const handleAddCertificate = async () => {
        if (!userId) return;

        if (!newCertName.trim()) {
            Alert.alert("Missing field", "Please enter a certificate name.");
            return;
        }

        if (!newCertIssuer.trim()) {
            Alert.alert("Missing field", "Please enter the issuing organisation.");
            return;
        }

        if (!newCertDate.trim()) {
            Alert.alert("Missing field", "Please enter the date earned.");
            return;
        }

        if (!isValidVerificationURL(newCertVerificationURL)) {
            Alert.alert("Invalid URL", "Please enter a valid HTTPS verification URL.");
            return;
        }

        let uploadedStoragePath = null;

        try {
            setSavingNewCertificate(true);

            let downloadURL = null;
            let storagePath = null;

            if (newCertFile) {
                const safeName = newCertFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");

                storagePath = `users/${userId}/certificates/${Date.now()}_${safeName}`;
                uploadedStoragePath = storagePath;

                const fileRef = ref(storage, storagePath);
                const response = await fetch(newCertFile.uri);
                const blob = await response.blob();

                await uploadBytes(fileRef, blob, {
                    contentType: newCertFile.mimeType || "application/octet-stream",
                });

                downloadURL = await getDownloadURL(fileRef);
            }

            const verificationResult = await checkCertificateURL({
                verificationURL: newCertVerificationURL.trim(),
                credentialId: newCertCredentialId.trim(),
                issuer: newCertIssuer.trim(),
            });

            await addDoc(collection(db, "users", userId, "certificates"), {
                name: newCertName.trim(),
                issuer: newCertIssuer.trim(),
                earnedDate: newCertDate.trim(),
                credentialId: newCertCredentialId.trim() || null,
                verificationURL: newCertVerificationURL.trim() || null,

                verificationStatus: verificationResult.verificationStatus || "unconfirmed",
                ownershipStatus: verificationResult.ownershipStatus || "unconfirmed",
                revocationStatus: verificationResult.revocationStatus || "unknown",
                verificationCheckedAt: serverTimestamp(),
                verificationMessage:
                    verificationResult.message ||
                    verificationResult.verificationMessage ||
                    null,
                detectedIssuer: verificationResult.issuer || null,
                verificationMethod: verificationResult.verificationMethod || null,

                downloadURL: downloadURL || null,
                storagePath: storagePath || null,

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setNewCertName("");
            setNewCertIssuer("");
            setNewCertDate("");
            setNewCertCredentialId("");
            setNewCertVerificationURL("");
            setNewCertFile(null);
            setAddingCertificate(false);

            Alert.alert("Success", "Certificate added successfully.");
        } catch (error) {
            console.error("Error adding certificate:", error);

            // Remove an uploaded file if saving the certificate record failed.
            if (uploadedStoragePath) {
                try {
                    await deleteObject(ref(storage, uploadedStoragePath));
                } catch (storageError) {
                    console.error("Could not clean up uploaded file:", storageError);
                }
            }

            Alert.alert("Error", "Could not add this certificate.");
        } finally {
            setSavingNewCertificate(false);
        }
    };

    // Edit Certificate
    const handleSaveCertificate = async () => {
        if (!userId || !editingCertificateId) return;

        if (!certName.trim() || !certIssuer.trim() || !certDate.trim()) {
            Alert.alert(
                "Missing information",
                "Certificate name, issuing organisation and date earned are required."
            );
            return;
        }

        if (!isValidVerificationURL(certVerificationURL)) {
            Alert.alert("Invalid URL", "Please enter a valid HTTPS verification URL.");
            return;
        }

        try {
            setSavingCertificate(true);

            await updateDoc(
                doc(db, "users", userId, "certificates", editingCertificateId),
                {
                    name: certName.trim(),
                    issuer: certIssuer.trim(),
                    earnedDate: certDate.trim(),
                    credentialId: certCredentialId.trim() || null,
                    verificationURL: certVerificationURL.trim() || null,
                    updatedAt: serverTimestamp(),
                }
            );

            setEditingCertificateId(null);
            Alert.alert("Success", "Certificate details updated.");
        } catch (error) {
            console.error("Error updating certificate:", error);
            Alert.alert("Error", "Could not update this certificate.");
        } finally {
            setSavingCertificate(false);
        }
    };

    // Delete Certificate and its Storage file
    const handleDeleteCertificate = (certificate) => {
        Alert.alert(
            "Delete Certificate",
            "Are you sure you want to delete this certificate and its uploaded file? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (certificate.storagePath) {
                                try {
                                    await deleteObject(
                                        ref(storage, certificate.storagePath)
                                    );
                                } catch (storageError) {
                                    // Continue deleting the Firestore record if the
                                    // file is already missing or cannot be removed.
                                    console.warn(
                                        "Certificate file could not be deleted:",
                                        storageError
                                    );
                                }
                            }

                            await deleteDoc(
                                doc(db, "users", userId, "certificates", certificate.id)
                            );

                            Alert.alert("Success", "Certificate deleted.");
                        } catch (error) {
                            console.error("Error deleting certificate:", error);
                            Alert.alert("Error", "Could not delete this certificate.");
                        }
                    },
                },
            ]
        );
    };

    // Open Certificate
    const handleOpenCertificate = async (certificate) => {
        if (certificate.downloadURL) {
            try {
                await Linking.openURL(certificate.downloadURL);
            } catch (error) {
                console.error("Open certificate error:", error);
                Alert.alert("Error", "Could not open this certificate.");
            }
        } else if (certificate.credentialId) {
            Alert.alert("Credential Information", certificate.credentialId);
        } else {
            Alert.alert(
                "No File Available",
                "This certificate does not have an uploaded file."
            );
        }
    };

    // Recheck Certificate
    const handleRecheckCertificate = async (certificate) => {
        if (!certificate.verificationURL && !certificate.credentialId) {
            Alert.alert(
                "No verification information",
                "This certificate does not have a verification URL or credential ID."
            );
            return;
        }

        try {
            setRecheckingCertificateId(certificate.id);

            const result = await checkCertificateURL({
                verificationURL: certificate.verificationURL || "",
                credentialId: certificate.credentialId || "",
                issuer: certificate.issuer || "",
            });

            await updateDoc(
                doc(db, "users", userId, "certificates", certificate.id),
                {
                    verificationStatus: result.verificationStatus || "unconfirmed",
                    ownershipStatus: result.ownershipStatus || "unconfirmed",
                    revocationStatus: result.revocationStatus || "unknown",
                    verificationCheckedAt: serverTimestamp(),
                    verificationMessage:
                        result.message || result.verificationMessage || null,
                    detectedIssuer: result.issuer || null,
                    verificationMethod: result.verificationMethod || null,
                }
            );

            Alert.alert(
                "Check complete",
                result.message || result.verificationMessage || "Certificate check completed."
            );
        } catch (error) {
            console.error("Certificate recheck error:", error);
            Alert.alert("Error", "Could not check this certificate.");
        } finally {
            setRecheckingCertificateId(null);
        }
    };

    // Certificate status labels
    const getVerificationStatus = (status) => {
        switch (status) {
            case "issuer_confirmed":
                return { label: "Issuer confirmed", color: "#16A34A", icon: "checkmark-circle" };
            case "revoked":
                return { label: "Revoked", color: colors.red, icon: "close-circle" };
            case "verified":
                return { label: "Verified", color: "#16A34A", icon: "checkmark-circle" };
            case "unconfirmed":
                return { label: "Unconfirmed", color: colors.amber, icon: "alert-circle" };
            case "unsupported":
                return { label: "Unsupported", color: colors.textSecondary, icon: "help-circle" };
            case "not_provided":
            default:
                return { label: "Not provided", color: colors.textSecondary, icon: "remove-circle" };
        }
    };

    const getOwnershipStatus = (status) => {
        switch (status) {
            case "confirmed":
                return { label: "Ownership confirmed", color: "#16A34A", icon: "checkmark-circle" };
            case "unconfirmed":
            default:
                return { label: "Ownership unconfirmed", color: colors.amber, icon: "alert-circle" };
        }
    };

    // Styles
    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: colors.background,
                },
                content: {
                    padding: spacing.lg,
                    paddingBottom: spacing.xl,
                },
                backButton: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: spacing.lg,
                },
                backText: {
                    color: colors.accentBlue,
                    fontSize: 14,
                    marginLeft: spacing.xs,
                },
                title: {
                    fontSize: 24,
                    fontWeight: "800",
                    color: colors.textPrimary,
                },
                subtitle: {
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                    marginBottom: spacing.lg,
                },
                card: {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                },
                label: {
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: spacing.sm,
                },
                value: {
                    color: colors.textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                    marginTop: 3,
                },
                sectionTitle: {
                    color: colors.textPrimary,
                    fontSize: 17,
                    fontWeight: "700",
                    marginBottom: spacing.sm,
                },
                message: {
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: spacing.xl,
                },
                input: {
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: spacing.xs,
                    marginBottom: spacing.md,
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                },
                dateRow: {
                    flexDirection: "row",
                    gap: spacing.md,
                },
                dateFieldContainer: {
                    flex: 1,
                    marginBottom: spacing.md,
                },
                dateField: {
                    backgroundColor: colors.surface,
                },
                actionButton: {
                    backgroundColor: colors.accentBlue,
                    padding: 12,
                    borderRadius: radius.md,
                    alignItems: "center",
                    marginTop: spacing.md,
                },
                actionButtonText: {
                    color: "#FFFFFF",
                    fontWeight: "700",
                },
                cancelButton: {
                    padding: 12,
                    alignItems: "center",
                },
                cancelButtonText: {
                    color: colors.textSecondary,
                    fontWeight: "600",
                },
                workEntry: {
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                },
                description: {
                    color: colors.textSecondary,
                    fontSize: 14,
                    marginTop: spacing.sm,
                    lineHeight: 20,
                },
                certificateFileBox: {
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderStyle: "dashed",
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: spacing.md,
                    marginBottom: spacing.md,
                },
                certificateFileText: {
                    color: colors.accentBlue,
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: spacing.xs,
                },
                certificateStatus: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginTop: spacing.sm,
                },
                certificateStatusText: {
                    fontSize: 12,
                    fontWeight: "600",
                },
                certificateLink: {
                    color: colors.accentBlue,
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: spacing.sm,
                },
            }),
        [colors, spacing, radius]
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator size="large" color={colors.accentBlue} />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>User not found.</Text>
            </View>
        );
    }

    const fullName =
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.accentBlue} />
                    <Text style={styles.backText}>Back to Admin Dashboard</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{fullName || "User Details"}</Text>
                <Text style={styles.subtitle}>Manage this user's profile.</Text>

                {/* Personal Information */}
                <TouchableOpacity
                    onPress={() => setEditing(!editing)}
                    style={styles.actionButton}
                >
                    <Text style={styles.actionButtonText}>
                        {editing ? "Cancel Editing" : "Edit Profile"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>First Name</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First name"
                            placeholderTextColor={colors.textSecondary}
                        />
                    ) : (
                        <Text style={styles.value}>{userData.firstName || "Not provided"}</Text>
                    )}

                    <Text style={styles.label}>Last Name</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last name"
                            placeholderTextColor={colors.textSecondary}
                        />
                    ) : (
                        <Text style={styles.value}>{userData.lastName || "Not provided"}</Text>
                    )}

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{userData.email || "Not provided"}</Text>

                    <Text style={styles.label}>Account Role</Text>
                    <Text style={styles.value}>{userData.role || "user"}</Text>

                    {editing && (
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            style={[styles.actionButton, { opacity: saving ? 0.6 : 1 }]}
                        >
                            <Text style={styles.actionButtonText}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Resumes */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Resumes ({resumes.length})</Text>

                    {resumesLoading ? (
                        <ActivityIndicator size="small" color={colors.accentBlue} />
                    ) : resumes.length === 0 ? (
                        <Text style={styles.message}>This user has not uploaded any resumes.</Text>
                    ) : (
                        resumes.map((resume) => {
                            const isEditingThisResume = editingResumeId === resume.id;

                            return (
                                <View key={resume.id} style={styles.workEntry}>
                                    {isEditingThisResume ? (
                                        <>
                                            <Text style={styles.label}>Resume Title</Text>
                                            <TextInput style={styles.input} value={resumeTitle} onChangeText={setResumeTitle} />

                                            <Text style={styles.label}>Target Role</Text>
                                            <TextInput style={styles.input} value={resumeTargetRole} onChangeText={setResumeTargetRole} />

                                            <Text style={styles.label}>Primary Industry</Text>
                                            <TextInput style={styles.input} value={resumeIndustry} onChangeText={setResumeIndustry} />

                                            <TouchableOpacity onPress={handleSaveResume} disabled={savingResume} style={styles.actionButton}>
                                                <Text style={styles.actionButtonText}>{savingResume ? "Saving..." : "Save Changes"}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setEditingResumeId(null)} style={styles.cancelButton}>
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.value}>{resume.title || "Untitled Resume"}</Text>
                                            <Text style={styles.label}>File: {resume.fileName || resume.name || "Unknown"}</Text>
                                            <Text style={styles.label}>Target Role: {resume.targetRole || "Not provided"}</Text>
                                            <Text style={styles.label}>Industry: {resume.industry || "Not provided"}</Text>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditingResumeId(resume.id);
                                                    setResumeTitle(resume.title || "");
                                                    setResumeTargetRole(resume.targetRole || "");
                                                    setResumeIndustry(resume.industry || "");
                                                }}
                                                style={styles.actionButton}
                                            >
                                                <Text style={styles.actionButtonText}>Edit Resume</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Work Experience */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Work Experience ({workExperiences.length})</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={() => setAddingWork(!addingWork)}>
                        <Text style={styles.actionButtonText}>
                            {addingWork ? "Cancel Adding" : "+ Add Work Experience"}
                        </Text>
                    </TouchableOpacity>

                    {addingWork && (
                        <View style={{ marginTop: spacing.md }}>
                            <Text style={styles.label}>Job Title *</Text>
                            <TextInput style={styles.input} placeholder="Job title" value={newWorkJobTitle} onChangeText={setNewWorkJobTitle} />

                            <Text style={styles.label}>Company *</Text>
                            <TextInput style={styles.input} placeholder="Company" value={newWorkCompany} onChangeText={setNewWorkCompany} />

                            <Text style={styles.label}>Location</Text>
                            <TextInput style={styles.input} placeholder="Location" value={newWorkLocation} onChangeText={setNewWorkLocation} />

                            <View style={styles.dateRow}>
                                <View style={styles.dateFieldContainer}>
                                    <MonthYearField label="Start date" value={newWorkStartDate} onChange={setNewWorkStartDate} fieldStyle={styles.dateField} />
                                </View>
                                <View style={styles.dateFieldContainer}>
                                    <MonthYearField label="End date" value={newWorkEndDate} onChange={setNewWorkEndDate} disabled={newWorkCurrentlyWorking} fieldStyle={styles.dateField} />
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => setNewWorkCurrentlyWorking((prev) => !prev)} style={{ marginVertical: spacing.sm }}>
                                <Text style={styles.value}>{newWorkCurrentlyWorking ? "☑" : "☐"} Currently working here</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Work Arrangement</Text>
                            <TextInput style={styles.input} placeholder="Remote, Hybrid or On-site" value={newWorkArrangement} onChangeText={setNewWorkArrangement} />

                            <Text style={styles.label}>Description</Text>
                            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} placeholder="Description" value={newWorkDescription} onChangeText={setNewWorkDescription} multiline />

                            <TouchableOpacity style={styles.actionButton} onPress={handleAddWork} disabled={savingNewWork}>
                                <Text style={styles.actionButtonText}>{savingNewWork ? "Adding..." : "Save New Experience"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingWork(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {workLoading ? (
                        <ActivityIndicator size="small" color={colors.accentBlue} />
                    ) : workExperiences.length === 0 ? (
                        <Text style={styles.message}>No work experience added.</Text>
                    ) : (
                        workExperiences.map((item) => (
                            <View key={item.id} style={styles.workEntry}>
                                {editingWorkId === item.id ? (
                                    <>
                                        <Text style={styles.label}>Job Title</Text>
                                        <TextInput style={styles.input} placeholder="Job title" value={workJobTitle} onChangeText={setWorkJobTitle} />

                                        <Text style={styles.label}>Company</Text>
                                        <TextInput style={styles.input} placeholder="Company" value={workCompany} onChangeText={setWorkCompany} />

                                        <Text style={styles.label}>Location</Text>
                                        <TextInput style={styles.input} placeholder="Location" value={workLocation} onChangeText={setWorkLocation} />

                                        <View style={styles.dateRow}>
                                            <View style={styles.dateFieldContainer}>
                                                <MonthYearField label="Start date" value={workStartDate} onChange={setWorkStartDate} fieldStyle={styles.dateField} />
                                            </View>
                                            <View style={styles.dateFieldContainer}>
                                                <MonthYearField label="End date" value={workEndDate} onChange={setWorkEndDate} disabled={workCurrentlyWorking} fieldStyle={styles.dateField} />
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={() => setWorkCurrentlyWorking((prev) => !prev)} style={{ marginVertical: spacing.sm }}>
                                            <Text style={styles.value}>{workCurrentlyWorking ? "☑" : "☐"} Currently working here</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.label}>Work Arrangement</Text>
                                        <TextInput style={styles.input} placeholder="Remote, Hybrid or On-site" value={workArrangement} onChangeText={setWorkArrangement} />

                                        <Text style={styles.label}>Description</Text>
                                        <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} placeholder="Description" value={workDescription} onChangeText={setWorkDescription} multiline />

                                        <TouchableOpacity style={styles.actionButton} onPress={handleSaveWork} disabled={savingWork}>
                                            <Text style={styles.actionButtonText}>{savingWork ? "Saving..." : "Save Changes"}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingWorkId(null)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.value}>{item.jobTitle || "Untitled Position"}</Text>
                                        <Text style={styles.label}>{item.company || "Company not provided"}</Text>
                                        {!!item.location && <Text style={styles.label}>{item.location}</Text>}
                                        <Text style={styles.label}>
                                            {item.startDate || "Not specified"} — {item.currentlyWorkHere ? "Present" : item.endDate || "Not specified"}
                                        </Text>
                                        {!!item.workArrangement && <Text style={styles.label}>{item.workArrangement}</Text>}
                                        {!!item.description && <Text style={styles.description}>{item.description}</Text>}

                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                setEditingWorkId(item.id);
                                                setWorkJobTitle(item.jobTitle || "");
                                                setWorkCompany(item.company || "");
                                                setWorkLocation(item.location || "");
                                                setWorkStartDate(item.startDate || null);
                                                setWorkEndDate(item.endDate || null);
                                                setWorkCurrentlyWorking(!!item.currentlyWorkHere);
                                                setWorkArrangement(item.workArrangement || "On-site");
                                                setWorkDescription(item.description || "");
                                            }}
                                        >
                                            <Text style={styles.actionButtonText}>Edit Work Experience</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#DC2626" }]} onPress={() => handleDeleteWork(item.id)}>
                                            <Text style={styles.actionButtonText}>Delete Work Experience</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Education */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Education ({educationEntries.length})</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={() => setAddingEducation(!addingEducation)}>
                        <Text style={styles.actionButtonText}>
                            {addingEducation ? "Cancel Adding" : "+ Add Education"}
                        </Text>
                    </TouchableOpacity>

                    {addingEducation && (
                        <View style={{ marginTop: spacing.md }}>
                            <Text style={styles.label}>Institution *</Text>
                            <TextInput style={styles.input} placeholder="e.g. La Trobe University" placeholderTextColor={colors.textSecondary} value={newEducationInstitution} onChangeText={setNewEducationInstitution} />

                            <Text style={styles.label}>Qualification *</Text>
                            <TextInput style={styles.input} placeholder="e.g. Bachelor of Information Technology" placeholderTextColor={colors.textSecondary} value={newEducationQualification} onChangeText={setNewEducationQualification} />

                            <Text style={styles.label}>Field of Study</Text>
                            <TextInput style={styles.input} placeholder="e.g. Software Development" placeholderTextColor={colors.textSecondary} value={newEducationFieldOfStudy} onChangeText={setNewEducationFieldOfStudy} />

                            <View style={styles.dateRow}>
                                <View style={styles.dateFieldContainer}>
                                    <MonthYearField label="Start date" value={newEducationStartDate} onChange={setNewEducationStartDate} fieldStyle={styles.dateField} />
                                </View>
                                <View style={styles.dateFieldContainer}>
                                    <MonthYearField label="End date" value={newEducationEndDate} onChange={setNewEducationEndDate} disabled={newEducationCurrentlyStudying} fieldStyle={styles.dateField} />
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => setNewEducationCurrentlyStudying((prev) => !prev)} style={{ marginVertical: spacing.sm }}>
                                <Text style={styles.value}>{newEducationCurrentlyStudying ? "☑" : "☐"} I am currently studying here</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Description</Text>
                            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} placeholder="Describe studies, achievements or relevant subjects..." placeholderTextColor={colors.textSecondary} value={newEducationDescription} onChangeText={setNewEducationDescription} multiline />

                            <TouchableOpacity style={styles.actionButton} onPress={handleAddEducation} disabled={savingNewEducation}>
                                <Text style={styles.actionButtonText}>{savingNewEducation ? "Adding..." : "Save Education"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingEducation(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {educationLoading ? (
                        <ActivityIndicator size="small" color={colors.accentBlue} />
                    ) : educationEntries.length === 0 ? (
                        <Text style={styles.message}>No education entries added.</Text>
                    ) : (
                        educationEntries.map((item) => (
                            <View key={item.id} style={styles.workEntry}>
                                {editingEducationId === item.id ? (
                                    <>
                                        <Text style={styles.label}>Institution *</Text>
                                        <TextInput style={styles.input} placeholder="Institution" value={educationInstitution} onChangeText={setEducationInstitution} />

                                        <Text style={styles.label}>Qualification *</Text>
                                        <TextInput style={styles.input} placeholder="Qualification" value={educationQualification} onChangeText={setEducationQualification} />

                                        <Text style={styles.label}>Field of Study</Text>
                                        <TextInput style={styles.input} placeholder="Field of study" value={educationFieldOfStudy} onChangeText={setEducationFieldOfStudy} />

                                        <View style={styles.dateRow}>
                                            <View style={styles.dateFieldContainer}>
                                                <MonthYearField label="Start date" value={educationStartDate} onChange={setEducationStartDate} fieldStyle={styles.dateField} />
                                            </View>
                                            <View style={styles.dateFieldContainer}>
                                                <MonthYearField label="End date" value={educationEndDate} onChange={setEducationEndDate} disabled={educationCurrentlyStudying} fieldStyle={styles.dateField} />
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={() => setEducationCurrentlyStudying((prev) => !prev)} style={{ marginVertical: spacing.sm }}>
                                            <Text style={styles.value}>{educationCurrentlyStudying ? "☑" : "☐"} I am currently studying here</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.label}>Description</Text>
                                        <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} placeholder="Description" value={educationDescription} onChangeText={setEducationDescription} multiline />

                                        <TouchableOpacity style={styles.actionButton} onPress={handleSaveEducation} disabled={savingEducation}>
                                            <Text style={styles.actionButtonText}>{savingEducation ? "Saving..." : "Save Changes"}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingEducationId(null)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.value}>{item.qualification || "Qualification not provided"}</Text>
                                        <Text style={styles.label}>{item.institution || "Institution not provided"}</Text>
                                        {!!item.fieldOfStudy && <Text style={styles.label}>{item.fieldOfStudy}</Text>}
                                        <Text style={styles.label}>
                                            {item.startDate || "Not specified"} — {item.currentlyStudying ? "Present" : item.endDate || "Not specified"}
                                        </Text>
                                        {!!item.description && <Text style={styles.description}>{item.description}</Text>}

                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                setEditingEducationId(item.id);
                                                setEducationInstitution(item.institution || "");
                                                setEducationQualification(item.qualification || "");
                                                setEducationFieldOfStudy(item.fieldOfStudy || "");
                                                setEducationStartDate(item.startDate || null);
                                                setEducationEndDate(item.endDate || null);
                                                setEducationCurrentlyStudying(!!item.currentlyStudying);
                                                setEducationDescription(item.description || "");
                                            }}
                                        >
                                            <Text style={styles.actionButtonText}>Edit Education</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#DC2626" }]} onPress={() => handleDeleteEducation(item.id)}>
                                            <Text style={styles.actionButtonText}>Delete Education</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Certificates */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Certificates ({certificates.length})</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setAddingCertificate(!addingCertificate)}
                    >
                        <Text style={styles.actionButtonText}>
                            {addingCertificate ? "Cancel Adding" : "+ Add Certificate"}
                        </Text>
                    </TouchableOpacity>

                    {addingCertificate && (
                        <View style={{ marginTop: spacing.md }}>
                            <Text style={styles.label}>Certificate Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Certificate name"
                                value={newCertName}
                                onChangeText={setNewCertName}
                            />

                            <Text style={styles.label}>Issuing Organisation *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Issuing organisation"
                                value={newCertIssuer}
                                onChangeText={setNewCertIssuer}
                            />

                            <Text style={styles.label}>Date Earned *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Oct 2025"
                                value={newCertDate}
                                onChangeText={setNewCertDate}
                            />

                            <Text style={styles.label}>Credential ID (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Credential ID"
                                value={newCertCredentialId}
                                onChangeText={setNewCertCredentialId}
                            />

                            <Text style={styles.label}>Verification URL (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/verify/..."
                                value={newCertVerificationURL}
                                onChangeText={setNewCertVerificationURL}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={styles.certificateFileBox}
                                onPress={handleChooseCertificateFile}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="cloud-upload-outline" size={24} color={colors.accentBlue} />
                                <Text style={styles.value}>Upload certificate / badge</Text>
                                <Text style={styles.label}>PDF, PNG or JPEG · Maximum 10 MB</Text>
                                <Text style={styles.certificateFileText}>
                                    {newCertFile ? newCertFile.name : "Choose file"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleAddCertificate}
                                disabled={savingNewCertificate}
                            >
                                <Text style={styles.actionButtonText}>
                                    {savingNewCertificate ? "Adding..." : "Save Certificate"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setAddingCertificate(false);
                                    setNewCertName("");
                                    setNewCertIssuer("");
                                    setNewCertDate("");
                                    setNewCertCredentialId("");
                                    setNewCertVerificationURL("");
                                    setNewCertFile(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {certificatesLoading ? (
                        <ActivityIndicator size="small" color={colors.accentBlue} />
                    ) : certificates.length === 0 ? (
                        <Text style={styles.message}>No certificates added.</Text>
                    ) : (
                        certificates.map((certificate) => {
                            const verification = getVerificationStatus(certificate.verificationStatus);
                            const ownership = getOwnershipStatus(certificate.ownershipStatus);
                            const isEditing = editingCertificateId === certificate.id;

                            return (
                                <View key={certificate.id} style={styles.workEntry}>
                                    {isEditing ? (
                                        <>
                                            <Text style={styles.label}>Certificate Name *</Text>
                                            <TextInput style={styles.input} value={certName} onChangeText={setCertName} />

                                            <Text style={styles.label}>Issuing Organisation *</Text>
                                            <TextInput style={styles.input} value={certIssuer} onChangeText={setCertIssuer} />

                                            <Text style={styles.label}>Date Earned *</Text>
                                            <TextInput style={styles.input} value={certDate} onChangeText={setCertDate} />

                                            <Text style={styles.label}>Credential ID</Text>
                                            <TextInput style={styles.input} value={certCredentialId} onChangeText={setCertCredentialId} />

                                            <Text style={styles.label}>Verification URL</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={certVerificationURL}
                                                onChangeText={setCertVerificationURL}
                                                keyboardType="url"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={handleSaveCertificate}
                                                disabled={savingCertificate}
                                            >
                                                <Text style={styles.actionButtonText}>
                                                    {savingCertificate ? "Saving..." : "Save Changes"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => setEditingCertificateId(null)}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                                                <Ionicons name="ribbon-outline" size={24} color={colors.amber} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.value}>
                                                        {certificate.name || "Unnamed Certificate"}
                                                    </Text>
                                                    <Text style={styles.label}>
                                                        {certificate.issuer || "Issuer not provided"}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.label}>
                                                Earned: {certificate.earnedDate || "Not provided"}
                                            </Text>

                                            {!!certificate.credentialId && (
                                                <Text style={styles.label}>
                                                    Credential ID: {certificate.credentialId}
                                                </Text>
                                            )}

                                            <View style={styles.certificateStatus}>
                                                <Ionicons name={verification.icon} size={15} color={verification.color} />
                                                <Text style={[styles.certificateStatusText, { color: verification.color }]}>
                                                    Issuer: {verification.label}
                                                </Text>
                                            </View>

                                            <View style={styles.certificateStatus}>
                                                <Ionicons name={ownership.icon} size={15} color={ownership.color} />
                                                <Text style={[styles.certificateStatusText, { color: ownership.color }]}>
                                                    {ownership.label}
                                                </Text>
                                            </View>

                                            {certificate.downloadURL ? (
                                                <TouchableOpacity onPress={() => handleOpenCertificate(certificate)}>
                                                    <Text style={styles.certificateLink}>Open uploaded certificate</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <Text style={styles.label}>No uploaded file</Text>
                                            )}

                                            {(certificate.verificationURL || certificate.credentialId) && (
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => handleRecheckCertificate(certificate)}
                                                    disabled={recheckingCertificateId === certificate.id}
                                                >
                                                    <Text style={styles.actionButtonText}>
                                                        {recheckingCertificateId === certificate.id ? "Checking..." : "Recheck Verification"}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => {
                                                    setEditingCertificateId(certificate.id);
                                                    setCertName(certificate.name || "");
                                                    setCertIssuer(certificate.issuer || "");
                                                    setCertDate(certificate.earnedDate || "");
                                                    setCertCredentialId(certificate.credentialId || "");
                                                    setCertVerificationURL(certificate.verificationURL || "");
                                                }}
                                            >
                                                <Text style={styles.actionButtonText}>Edit Certificate</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: "#DC2626" }]}
                                                onPress={() => handleDeleteCertificate(certificate)}
                                            >
                                                <Text style={styles.actionButtonText}>Delete Certificate</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
