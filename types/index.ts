export interface SimplifyResult {
  summary: string;
  eligibility: string;
  documentsNeeded: string[];
  nextSteps: Array<{
    title: string;
    detail: string;
  }>;
  redFlags?: string[];
}

export interface ExampleDocument {
  id: string;
  title: string;
  subtitle: string;
  text: string;
}

export interface Scheme {
  id: string;
  name: string;
  category: "student" | "farmer" | "senior_citizen" | "women" | "healthcare" | "general";
  description: string;
  eligibility: {
    minAge: number | null;
    maxAge: number | null;
    maxIncome: number | null;
    occupation: string[] | null;
    states: string[];
    gender: string | null;
    categories: string[] | null;
    specialConditions: string[];
    educationLevel?: string[];
    course?: string[];
  };
  documentsNeeded: string[];
}

export interface MatchedScheme extends Scheme {
  reason: string;
  relevanceScore: number;
}
