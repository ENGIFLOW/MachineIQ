export type GCodeIssueSeverity = 'info' | 'warning' | 'critical'

export type GCodeIssueCategory =
  | 'safety'
  | 'efficiency'
  | 'syntax'
  | 'quality'
  | 'machine'

export interface GCodeOptimization {
  title: string
  description: string
  estimatedImpact: string
}

export interface GCodeReviewIssue {
  id: string
  line: number
  code?: string
  category: GCodeIssueCategory
  severity: GCodeIssueSeverity
  explanation: string
  recommendation: string
}

export interface GCodeReviewSummary {
  cycleTimeDelta?: string
  sparkCostEstimate: number
  confidence: number
  overallAssessment: string
}

export interface GCodeReviewResponse {
  issues: GCodeReviewIssue[]
  optimizations: GCodeOptimization[]
  summary: GCodeReviewSummary
}

export interface GCodeReviewRequest {
  program: string
  machineProfile?: string
}


