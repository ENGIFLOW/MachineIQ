'use client'

import { useState } from 'react'

type Preset = {
  id: string
  name: string
  description: string
  snippet: string
}

const presets: Preset[] = [
  {
    id: 'haas-mm',
    name: 'HAAS VF-2 (Metric)',
    description:
      'Starter contour program with tool change and coolant commands.',
    snippet: `O1001
T1 M06
G90 G54 G00 X0 Y0
S4500 M03
G43 Z50. H1
G01 Z5. F300.
G01 Z-5. F120.
G01 X50. Y0. F800.
G01 X50. Y50.
G01 X0. Y50.
G01 X0. Y0.
G00 Z50.
M09
G53 G49 Z0.
M30`,
  },
  {
    id: 'lathe-imperial',
    name: '2-Axis Lathe (Imperial)',
    description: 'Facing + OD roughing routine with canned cycle.',
    snippet: `O2002(TURN_COMPONENT)
G20 G40 G80 G97
T101
G50 S2000
G96 S500
G00 X2.0 Z0.1
G01 Z0. F.01
G01 X0.
G00 X2.
G00 Z0.2
G71 P10 Q20 U0.02 W0.005 F0.012
N10 G00 X1.5 Z0.
G01 Z-2.
G01 X1.75
N20 G70 P10 Q20
M30`,
  },
]

export function GCodeEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null)

  const handlePreset = (preset: Preset) => {
    setSelectedPreset(preset)
    onChange(preset.snippet)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">G-code input</h2>
        {selectedPreset && (
          <span className="text-xs text-muted-ink">
            Loaded preset: {selectedPreset.name}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste your CNC program here..."
        spellCheck={false}
        className="min-h-[360px] w-full rounded-2xl border border-ink/10 bg-surface-strong/60 p-4 font-mono text-sm text-ink focus:border-[hsl(var(--spark))] focus:outline-none"
      />
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
          Or load a preset
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 text-left transition hover:border-[hsl(var(--spark))] hover:shadow-md"
              onClick={() => handlePreset(preset)}
            >
              <h3 className="text-sm font-semibold text-ink">{preset.name}</h3>
              <p className="mt-1 text-xs text-muted-ink">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


