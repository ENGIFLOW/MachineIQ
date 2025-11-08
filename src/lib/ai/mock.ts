import type { GCodeReviewRequest, GCodeReviewResponse } from './types'

const mockIssues: GCodeReviewResponse['issues'] = [
  {
    id: 'issue-1',
    line: 6,
    code: 'G43 Z50. H1',
    category: 'safety',
    severity: 'critical',
    explanation:
      'Tool length compensation is activated, but there is no verification move before plunging. If the H1 value is wrong, the tool could crash into the stock.',
    recommendation:
      'Add a safe Z check or probe move after applying G43 to confirm the tool length offset is correct before plunging.',
  },
  {
    id: 'issue-2',
    line: 9,
    category: 'efficiency',
    severity: 'warning',
    explanation:
      'Feed rate F800 is applied to all contour moves, but the machine can safely handle 1200 mm/min on this material and tool.',
    recommendation:
      'Increase the feed rate to F1200 on the long straight segments to reduce cycle time by ~15%.',
  },
  {
    id: 'issue-3',
    line: 12,
    code: 'M09',
    category: 'quality',
    severity: 'info',
    explanation:
      'Coolant is turned off immediately upon retract. Depending on surface finish requirements, you may want to leave coolant on until the spindle stops.',
    recommendation:
      'Delay M09 until after the final retract or add an air blast to clear chips before coolant shutoff.',
  },
]

const mockOptimizations: GCodeReviewResponse['optimizations'] = [
  {
    title: 'Add ramp entry instead of straight plunge',
    description:
      'Replace the direct Z plunge with a shallow ramp to extend tool life and reduce chatter in harder materials.',
    estimatedImpact: '-5 seconds cycle time, +18% tool longevity',
  },
  {
    title: 'Enable high-speed toolpath smoothing',
    description:
      'Activate the machine’s look-ahead / smoothing mode (e.g., G187) for tighter contour accuracy at higher feed rates.',
    estimatedImpact: 'Improved dimensional accuracy at F1200',
  },
]

const mockSummary: GCodeReviewResponse['summary'] = {
  cycleTimeDelta: '-00:00:24',
  sparkCostEstimate: 12,
  confidence: 0.82,
  overallAssessment:
    'Program is production-ready with minor tweaks. Address the safety item before releasing to the floor.',
}

export function generateMockGcodeReview(
  request: GCodeReviewRequest
): GCodeReviewResponse {
  const trimmed = request.program.trim()
  if (!trimmed) {
    return {
      issues: [],
      optimizations: [],
      summary: {
        sparkCostEstimate: 0,
        confidence: 0,
        overallAssessment:
          'Paste your CNC program to receive a detailed AI review with safety, efficiency, and quality insights.',
      },
    }
  }

  return {
    issues: mockIssues,
    optimizations: mockOptimizations,
    summary: mockSummary,
  }
}


