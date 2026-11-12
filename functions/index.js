const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

async function fetchCredlyJSON(url) {
    const parsedURL = new URL(url);

    //Only allows requests to Credly's AP.
    if (
        parsedURL.protocol !== "https:" ||
        parsedURL.hostname !== "api.credly.com"
    ) {
        throw new Error("Untrusted Credly API URL.");
    }

    const response = await fetch(parsedURL, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        redirect: "error",
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        throw new Error(`Credly API returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error("Invalid Credly API response.");
    }

    // Limit API responses to 1 MB.
    const MAX_RESPONSE_SIZE = 1024 * 1024;

    const contentLength = Number(
        response.headers.get("content-length") || 0
    );

    if (contentLength > MAX_RESPONSE_SIZE) {
        throw new Error("Credly API response is too large.");
    }

    if (!response.body) {
        throw new Error("Credly API returned an empty response.");
    }

    const reader = response.body.getReader();
    const chunks = [];
    let totalSize = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        totalSize += value.length;

        if (totalSize > MAX_RESPONSE_SIZE) {
            await reader.cancel();
            throw new Error("Credly API response is too large.");
        }

        chunks.push(value);
    }

    const responseBuffer = Buffer.concat(chunks);

    try {
        return JSON.parse(responseBuffer.toString("utf8"));
    } catch {
        throw new Error("Invalid JSON returned by Credly API.");
    }
}

// Add supported certificate issuer domains here
const ISSUER_ADAPTERS = [
    {
        name: "Credly",
        domains: ["credly.com", "www.credly.com"],

        verify: async ({ verificationURL, credentialId }) => {
            if (!verificationURL) {
                return {
                    verificationStatus: "unconfirmed",
                    issuer: "Credly",
                    verificationMethod: "credential_id",
                    message: "Credential ID received. A public Credly badge URL is needed for this verification method.",
                };
            }

            const parsedURL = new URL(verificationURL);

            const match = parsedURL.pathname.match(
                /^\/badges\/([a-f0-9-]{36})\/public_url\/?$/
            );

            if (
                !["credly.com", "www.credly.com"].includes(parsedURL.hostname) ||
                !match
            ) {
                throw new Error("Invalid Credly badge URL.");
            }

            const badgeId = match[1];

            const assertion = await fetchCredlyJSON(
                `https://api.credly.com/api/v1/obi/v2/badge_assertions/${badgeId}`
            );

            if (
                assertion.type !== "Assertion" ||
                assertion.id !==
                    `https://api.credly.com/api/v1/obi/v2/badge_assertions/${badgeId}` ||
                typeof assertion.badge !== "string" ||
                !assertion.badge.startsWith(
                    "https://api.credly.com/api/v1/obi/v2/issuers/"
                )
            ) {
                throw new Error("Invalid badge assertion.");
            }

            const badgeURL = new URL(assertion.badge);

            if (
                badgeURL.protocol !== "https:" ||
                badgeURL.hostname !== "api.credly.com" ||
                badgeURL.username ||
                badgeURL.password ||
                !/^\/api\/v1\/obi\/v2\/issuers\/[a-f0-9-]{36}\/badge_classes\/[a-f0-9-]{36}$/.test(
                    badgeURL.pathname
                )
            ) {
                throw new Error("Invalid badge class URL.");
            }

            const badgeClass = await fetchCredlyJSON(assertion.badge);

            if (
                badgeClass.type !== "BadgeClass" ||
                typeof badgeClass.name !== "string" ||
                typeof badgeClass.issuer?.name !== "string" ||
                !badgeClass.name.trim() ||
                !badgeClass.issuer.name.trim()
            ) {
                throw new Error("Invalid badge issuer information.");
            }

            const issuerName = badgeClass.issuer.name;
            
            const revocationStatus =
            assertion.revoked === true ? "revoked" : assertion.revoked === false ? "not_revoked" : "unknown";

            return {

                verificationStatus: revocationStatus === "revoked"
                    ? "revoked"
                    : "issuer_confirmed",

                ownershipStatus: "unconfirmed",
                revocationStatus,

                issuer: issuerName,
                badgeName: badgeClass.name || null,
                verificationMethod: "url",

                message:
                    revocationStatus === "revoked"
                        ? "Credly reports that this badge has been revoked."
                        : revocationStatus === "not_revoked"
                            ? `Issuer confirmed. Badge found: ${badgeClass.name}. Issuer: ${issuerName}. No revocation was reported by Credly. Ownership remains unconfirmed.`
                            : `Issuer confirmed. Badge found: ${badgeClass.name}. Issuer: ${issuerName}. Credly did not provide revocation information. Ownership remains unconfirmed.`,
            };
        },
    },
    
    {
        name: "Coursera",
        domains: ["coursera.org", "www.coursera.org"],
        verify: async ({ verificationURL, credentialId }) => ({
            verificationStatus: "unconfirmed",
            issuer: "Coursera",
            verificationMethod: verificationURL && credentialId
                ? "url_and_id"
                : verificationURL
                    ? "url"
                    : "credential_id",
            message: "Coursera identified. Authenticity still needs confirmation from the issuer.",
        }),
    },
];

function detectIssuer(verificationURL, issuerName) {
    if (verificationURL) {
        try {
            const hostname = new URL(verificationURL).hostname.toLowerCase();

            const matchedIssuer = ISSUER_ADAPTERS.find((issuer) =>
                issuer.domains.some(
                    (domain) =>
                        hostname === domain ||
                        hostname.endsWith(`.${domain}`)
                )
            );

            if (matchedIssuer) {
                return matchedIssuer;
            }
        } catch {
            return null;
        }
    }

    if (issuerName) {
        return ISSUER_ADAPTERS.find(
            (issuer) =>
                issuer.name.toLowerCase() === issuerName.trim().toLowerCase()
        ) || null;
    }

    return null;
}

exports.checkCertificateURL = onCall(
    {
        region: "australia-southeast1",
        timeoutSeconds: 30,
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "You must be logged in."
            );
        }

        const data = request.data;

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new HttpsError(
                "invalid-argument",
                "Invalid verification request."
            );
        }

        const { verificationURL, credentialId, issuer: issuerName } = data;

        if (
            issuerName !== undefined &&
            typeof issuerName !== "string"
        ) {
            throw new HttpsError(
                "invalid-argument",
                "Invalid issuer name."
            );
        }

        const cleanURL =
            typeof verificationURL === "string"
                ? verificationURL.trim()
                : "";

        const cleanCredentialId =
            typeof credentialId === "string"
                ? credentialId.trim()
                : "";

                if (
                    cleanURL.length > 2048 ||
                    cleanCredentialId.length > 256 ||
                    (issuerName && issuerName.length > 100)
                ) {
                    throw new HttpsError(
                        "invalid-argument",
                        "One or more verification fields are too long."
                    );
        }

        if (!cleanURL && !cleanCredentialId) {
            throw new HttpsError(
                "invalid-argument",
                "A verification URL or Credential ID is required."
            );
        }

        let url = null;

        if (cleanURL) {
            try {
                url = new URL(cleanURL);
            } catch {
                throw new HttpsError(
                    "invalid-argument",
                    "Invalid verification URL."
                );
            }

            if (
                url.protocol !== "https:" ||
                url.username ||
                url.password
            ) {
                throw new HttpsError(
                    "invalid-argument",
                    "Please provide a valid HTTPS URL."
                );
            }
        }

        const issuer = detectIssuer(cleanURL, issuerName);

        if (!issuer) {
            return {
                verificationStatus: "unsupported",
                message: cleanURL
                    ? "This issuer is not integrated yet. You can still save the certificate for manual review."
                    : "Automatic Credential ID verification is not available for this issuer yet.",
            };
        }

        try {
            return await issuer.verify({
                verificationURL: cleanURL || null,
                credentialId: cleanCredentialId || null,
            });
        } catch (error) {
            logger.error("Issuer verification failed:", error);

            return {
                verificationStatus: "unconfirmed",
                message: "The issuer could not be checked. Please try again later.",
            };
        }
    }
);