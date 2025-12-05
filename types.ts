export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  applicationUrl: string;
}

export interface Course {
  title: string;
  provider: string;
  duration: string;
  cost: string;
  url: string;
  description: string;
}

export interface MatchResult {
  jobId: string;
  matchScore: number; // 0 to 100
  missingSkills: string[];
  reasoning: string;
  recommendedCourses?: Course[];
}

export interface CandidateProfile {
  name?: string;
  summary: string;
  extractedSkills: Skill[];
  yearsExperience: number;
  suggestedRoles: string[];
}