export interface SimplifyResult {
  summary: string;
  eligibility: string;
  documentsNeeded: string[];
  nextSteps: Array<{
    title: string;
    detail: string;
  }>;
}

export interface ExampleDocument {
  id: string;
  title: string;
  subtitle: string;
  text: string;
}
