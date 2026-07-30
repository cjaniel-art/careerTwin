/**
 * Canonical event catalog — Analytics §3/§18. Names, casing (snake_case,
 * `objeto_ação`) and past tense come directly from the source document; this
 * file is the only place event names may be defined (§3: "não criar nomes
 * dinamicamente"). Includes the full documented catalog, not only the events
 * this session wired up — §18: "Eventos não documentados não devem ser
 * enviados à produção" implies the inverse is also true: the catalog is not
 * limited to what is currently fired.
 */
export const ANALYTICS_EVENTS = {
  // §5 — aquisição
  landingViewed: "landing_viewed",
  landingPrimaryCtaClicked: "landing_primary_cta_clicked",
  landingSecondaryCtaClicked: "landing_secondary_cta_clicked",
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  loginStarted: "login_started",
  loginCompleted: "login_completed",
  loginFailed: "login_failed",

  // §6 — onboarding
  onboardingStarted: "onboarding_started",
  onboardingResumed: "onboarding_resumed",
  resumeUploaded: "resume_uploaded",
  linkedinUploaded: "linkedin_uploaded",
  uploadFailed: "upload_failed",
  onboardingCompleted: "onboarding_completed",
  onboardingStepViewed: "onboarding_step_viewed",
  onboardingStepCompleted: "onboarding_step_completed",
  resumeValidationFailed: "resume_validation_failed",
  linkedinValidationFailed: "linkedin_validation_failed",
  resumeReplaced: "resume_replaced",
  linkedinReplaced: "linkedin_replaced",
  onboardingAbandoned: "onboarding_abandoned",

  // §7 — Thin Twin e contexto-alvo
  twinExtractionStarted: "twin_extraction_started",
  twinExtractionCompleted: "twin_extraction_completed",
  twinExtractionFailed: "twin_extraction_failed",
  twinReviewStarted: "twin_review_started",
  twinFieldCorrected: "twin_field_corrected",
  twinFieldAdded: "twin_field_added",
  twinFieldRemoved: "twin_field_removed",
  twinConflictResolved: "twin_conflict_resolved",
  twinProfileConfirmed: "twin_profile_confirmed",
  twinVersionCreated: "twin_version_created",
  targetRoleDefined: "target_role_defined",
  targetRoleSuggested: "target_role_suggested",
  targetRoleSelected: "target_role_selected",

  // §8 — Core 1
  profileAnalysisStarted: "profile_analysis_started",
  profileAnalysisCompleted: "profile_analysis_completed",
  profileAnalysisFailed: "profile_analysis_failed",
  profileAnalysisViewed: "profile_analysis_viewed",
  recommendationViewed: "recommendation_viewed",
  recommendationSelected: "recommendation_selected",
  actionStarted: "action_started",
  actionCompleted: "action_completed",
  experienceSuggestionCopied: "experience_suggestion_copied",
  profileReanalysisStarted: "profile_reanalysis_started",
  profileReanalysisCompleted: "profile_reanalysis_completed",
  profileAnalysisBlocked: "profile_analysis_blocked",
  profileAnalysisReused: "profile_analysis_reused",
  profileAnalysisLowConfidence: "profile_analysis_low_confidence",
  ippDimensionViewed: "ipp_dimension_viewed",
  evidenceViewed: "evidence_viewed",
  recommendationStatusChanged: "recommendation_status_changed",
  actionStatusChanged: "action_status_changed",

  // §9 — Core 2
  jobAnalysisStarted: "job_analysis_started",
  jobAnalysisCompleted: "job_analysis_completed",
  jobAnalysisFailed: "job_analysis_failed",
  jobAnalysisViewed: "job_analysis_viewed",
  jobRecommendationReceived: "job_recommendation_received",
  targetRoleAnalysisStarted: "target_role_analysis_started",
  targetRoleAnalysisCompleted: "target_role_analysis_completed",
  opportunityUploadStarted: "opportunity_upload_started",
  opportunityUploadCompleted: "opportunity_upload_completed",
  opportunityValidationFailed: "opportunity_validation_failed",
  opportunityStructuringCompleted: "opportunity_structuring_completed",
  opportunityConfirmed: "opportunity_confirmed",
  iaoRequirementViewed: "iao_requirement_viewed",
  applicationIntentSubmitted: "application_intent_submitted",
  opportunityActionStarted: "opportunity_action_started",
  opportunityActionCompleted: "opportunity_action_completed",
  fitReanalysisStarted: "fit_reanalysis_started",
  fitReanalysisCompleted: "fit_reanalysis_completed",

  // §10 — feedback (analysisFeedbackSubmitted shared with §8/§9)
  analysisFeedbackSubmitted: "analysis_feedback_submitted",
  csatSubmitted: "csat_submitted",
  specificityFeedbackSubmitted: "specificity_feedback_submitted",

  // §11 — monetização simulada
  creditsViewed: "credits_viewed",
  paywallViewed: "paywall_viewed",
  packageSelected: "package_selected",
  purchaseIntentConfirmed: "purchase_intent_confirmed",
  purchaseIntentAbandoned: "purchase_intent_abandoned",
  creditConsumed: "credit_consumed",
  creditRestored: "credit_restored",

  // §12 — privacidade (auditoria interna; account_deletion_requested pode
  // ter versão mínima em analytics de produto per §12)
  consentRecorded: "consent_recorded",
  consentRevoked: "consent_revoked",
  accountDeletionRequested: "account_deletion_requested",
  accountDeleted: "account_deleted",
  documentDeleted: "document_deleted",
  documentDeletionFailed: "document_deletion_failed",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
