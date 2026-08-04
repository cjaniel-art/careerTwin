import type { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Real Thin Twin content for a confirmed profile version, shaped for the AI
 * engines (P-005/P-009) — PRD 03 §17 lists this as the engine's actual input
 * ("experiências; projetos; competências; ferramentas; resultados;
 * evidências; formação; certificações"), not just counts. Every id here is
 * stable and safe to echo back as `evidenceRefs[].sourceId`.
 *
 * Deliberately excludes PII (name, email, city, state, age, photo) per the
 * same section's "dados proibidos ao motor" — this only reads professional
 * facts already scoped to the profile version.
 */
export interface ProfileContextPayload {
  experiences: Array<{
    id: string;
    companyName: string;
    roleTitle: string;
    employmentType: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    scopeSummary: string | null;
    responsibilities: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    context: string | null;
    objective: string | null;
    userRole: string | null;
    activities: unknown;
    deliverables: unknown;
    results: unknown;
  }>;
  skills: Array<{
    id: string;
    name: string;
    skillType: string;
    originalTerm: string;
    declaredLevel: string | null;
  }>;
  tools: Array<{
    id: string;
    name: string;
    originalTerm: string;
    usageContext: string | null;
    declaredLevel: string | null;
  }>;
  evidences: Array<{
    id: string;
    evidenceType: string;
    summary: string;
    context: string | null;
    sourceType: "resume" | "linkedin" | "user";
    sourceSnippet: string | null;
  }>;
  education: Array<{ id: string; institution: string; degree: string | null; fieldOfStudy: string | null }>;
  certifications: Array<{ id: string; name: string; issuer: string | null }>;
  languages: Array<{ id: string; language: string; proficiency: string | null }>;
}

export async function fetchProfileContext(
  supabase: SupabaseClient,
  profileVersionId: string,
): Promise<ProfileContextPayload> {
  const [
    { data: experiences },
    { data: projects },
    { data: profileSkills },
    { data: profileTools },
    { data: evidences },
    { data: education },
    { data: certifications },
    { data: languages },
  ] = await Promise.all([
    supabase
      .from("experiences")
      .select("id, company_name, role_title, employment_type, start_date, end_date, is_current, description, scope_summary")
      .eq("profile_version_id", profileVersionId),
    supabase
      .from("projects")
      .select("id, name, context, objective, user_role, activities, deliverables, results")
      .eq("profile_version_id", profileVersionId),
    supabase
      .from("profile_skills")
      .select("id, original_term, declared_level, skills(normalized_name, skill_type)")
      .eq("profile_version_id", profileVersionId),
    supabase
      .from("profile_tools")
      .select("id, original_term, usage_context, declared_level, tools(normalized_name)")
      .eq("profile_version_id", profileVersionId),
    supabase
      .from("evidences")
      .select("id, evidence_type, summary, context, source_type, source_snippet")
      .eq("profile_version_id", profileVersionId),
    supabase.from("education_records").select("id, institution, degree, field_of_study").eq("profile_version_id", profileVersionId),
    supabase.from("certifications").select("id, name, issuer").eq("profile_version_id", profileVersionId),
    supabase.from("languages").select("id, language, proficiency").eq("profile_version_id", profileVersionId),
  ]);

  const experienceIds = (experiences ?? []).map((e) => e.id);
  const { data: responsibilitiesByExperience } =
    experienceIds.length > 0
      ? await supabase.from("experience_responsibilities").select("experience_id, description").in("experience_id", experienceIds)
      : { data: [] as { experience_id: string; description: string }[] };

  const responsibilitiesMap = new Map<string, string[]>();
  for (const r of responsibilitiesByExperience ?? []) {
    const list = responsibilitiesMap.get(r.experience_id) ?? [];
    list.push(r.description);
    responsibilitiesMap.set(r.experience_id, list);
  }

  return {
    experiences: (experiences ?? []).map((e) => ({
      id: e.id,
      companyName: e.company_name,
      roleTitle: e.role_title,
      employmentType: e.employment_type,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: e.is_current,
      description: e.description,
      scopeSummary: e.scope_summary,
      responsibilities: responsibilitiesMap.get(e.id) ?? [],
    })),
    projects: (projects ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      context: p.context,
      objective: p.objective,
      userRole: p.user_role,
      activities: p.activities,
      deliverables: p.deliverables,
      results: p.results,
    })),
    skills: (profileSkills ?? []).map((s) => {
      const skill = Array.isArray(s.skills) ? s.skills[0] : s.skills;
      return {
        id: s.id,
        name: skill?.normalized_name ?? s.original_term,
        skillType: skill?.skill_type ?? "other",
        originalTerm: s.original_term,
        declaredLevel: s.declared_level,
      };
    }),
    tools: (profileTools ?? []).map((t) => {
      const tool = Array.isArray(t.tools) ? t.tools[0] : t.tools;
      return {
        id: t.id,
        name: tool?.normalized_name ?? t.original_term,
        originalTerm: t.original_term,
        usageContext: t.usage_context,
        declaredLevel: t.declared_level,
      };
    }),
    evidences: (evidences ?? []).map((ev) => ({
      id: ev.id,
      evidenceType: ev.evidence_type,
      summary: ev.summary,
      context: ev.context,
      sourceType: ev.source_type as "resume" | "linkedin" | "user",
      sourceSnippet: ev.source_snippet,
    })),
    education: (education ?? []).map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.field_of_study,
    })),
    certifications: (certifications ?? []).map((c) => ({ id: c.id, name: c.name, issuer: c.issuer })),
    languages: (languages ?? []).map((l) => ({ id: l.id, language: l.language, proficiency: l.proficiency })),
  };
}

export interface TargetContextPayload {
  targetArea: string;
  targetRole: string;
  desiredSeniority: string;
  transitionType: string | null;
  searchContext: string | null;
  preferences: unknown;
}

export async function fetchTargetContext(
  supabase: SupabaseClient,
  targetContextVersionId: string,
): Promise<TargetContextPayload | null> {
  const { data } = await supabase
    .from("target_context_versions")
    .select("target_area, target_role, desired_seniority, transition_type, search_context, preferences")
    .eq("id", targetContextVersionId)
    .maybeSingle();
  if (!data) return null;
  return {
    targetArea: data.target_area,
    targetRole: data.target_role,
    desiredSeniority: data.desired_seniority,
    transitionType: data.transition_type,
    searchContext: data.search_context,
    preferences: data.preferences,
  };
}

export interface RequirementContextPayload {
  id: string;
  description: string;
  category: string;
  criticality: string;
  sourceExcerpt: string;
}

export async function fetchRequirementsContext(
  supabase: SupabaseClient,
  opportunityVersionId: string,
): Promise<RequirementContextPayload[]> {
  const { data } = await supabase
    .from("requirements")
    .select("id, description, category, criticality, applicability, source_excerpt")
    .eq("opportunity_version_id", opportunityVersionId)
    .neq("applicability", "not_applicable");
  return (data ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    category: r.category,
    criticality: r.criticality,
    sourceExcerpt: r.source_excerpt,
  }));
}
