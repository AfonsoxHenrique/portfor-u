const KNOWN_SITES = [
    { domain: "github.com", label: "GitHub", icon: "logo-github" },
    { domain: "behance.net", label: "Behance", icon: "logo-behance" },
    { domain: "dribbble.com", label: "Dribbble", icon: "logo-dribbble" },
    { domain: "figma.com", label: "Figma", icon: "logo-figma" },
    { domain: "youtube.com", label: "YouTube", icon: "logo-youtube" },
    { domain: "youtu.be", label: "YouTube", icon: "logo-youtube" },
    { domain: "vimeo.com", label: "Vimeo", icon: "logo-vimeo" },
    { domain: "instagram.com", label: "Instagram", icon: "logo-instagram" },
    { domain: "linkedin.com", label: "LinkedIn", icon: "logo-linkedin" },
    { domain: "medium.com", label: "Medium", icon: "logo-medium" },
    { domain: "docs.google.com", label: "Google Docs", icon: "document-text-outline" },
    { domain: "drive.google.com", label: "Google Drive", icon: "folder-open-outline" },
    { domain: "canva.com", label: "Canva", icon: "color-palette-outline" },
];

const getHost = (url) =>
    url.trim().replace(/^https?:\/\//i, "").split(/[/?#]/)[0].replace(/^www\./i, "").toLowerCase();

export const getLinkMeta = (url = "") => {
    const host = getHost(url);
    const known = KNOWN_SITES.find((s) => host === s.domain || host.endsWith(`.${s.domain}`));
    if (known) return known;
    return { label: host || "Link", icon: "link-outline" };
};

export const normalizeUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};