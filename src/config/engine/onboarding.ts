/**
 * Onboarding configuration — PRD 01 §43 (`ONBOARDING_CONFIG`, literal block).
 * Single source of truth for upload limits, retention windows, and content
 * thresholds; never duplicate these numbers elsewhere.
 */
export const ONBOARDING_CONFIG = {
  documents: {
    allowedExtensions: ["pdf", "docx", "txt"],
    maxFileSizeMb: 10,
    maxPages: 50,
    maxOriginalFileNameCharacters: 120,
    maxPastedTextCharacters: 100_000,
    passwordProtectedFiles: "reject",
  },

  upload: {
    timeoutSeconds: 120,
    slowConnectionWarningSeconds: 30,
  },

  processing: {
    nativeMedianSeconds: 30,
    nativeP95Seconds: 60,
    ocrMedianSeconds: 90,
    ocrP95Seconds: 180,
    attemptTimeoutSeconds: 300,
    maxAttempts: 3,
    visibilityTimeoutSeconds: 360,
    stalledJobMinutes: 10,
  },

  retention: {
    originalFileHours: 24,
    successfulIntermediateHours: 6,
    failedIntermediateHours: 24,
    technicalLogDays: 30,
  },

  content: {
    minimumUsefulCharacters: 300,
    duplicateSourceThreshold: 0.85,
    ocrMinimumCharactersPerPage: 20,
    ocrPagesWithoutTextThreshold: 0.7,
  },

  limits: {
    experiences: 30,
    projects: 50,
    skills: 150,
    tools: 100,
    education: 20,
    certifications: 50,
    evidencePerExperience: 20,
    responsibilitiesPerExperience: 30,
  },

  personalData: {
    fullName: "required",
    city: "optional",
    state: "optional",
    birthDate: "not_collected",
    postalCode: "not_collected",
    fullAddress: "not_collected",
  },
} as const;
