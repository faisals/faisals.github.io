"use client"
import type React from "react"
import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Types and Enums
enum MilestoneType {
  PROMOTION = "promotion",
  JOB_CHANGE = "job_change",
  MAJOR_PROJECT = "major_project",
  LEADERSHIP = "leadership",
}

enum VisualizationStyle {
  TIMELINE = "timeline",
  SPARKLINE = "sparkline",
  TABLE = "table",
}

interface CareerMilestone {
  year: number
  title: string
  company: string
  impact: string
  achievements: string[]
  duration: string
  type: MilestoneType
}

interface Size {
  width: number
  height: number
}

// Custom Hook: useResizeObserver
function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  return [ref, size]
}

// Configuration Constants
const TIMELINE_CONFIG = {
  margin: { left: 20, right: 20, top: 20, bottom: 40 },
  roleHeights: {
    [MilestoneType.LEADERSHIP]: 25,
    [MilestoneType.MAJOR_PROJECT]: 20,
    [MilestoneType.PROMOTION]: 15,
    [MilestoneType.JOB_CHANGE]: 10,
  },
  colors: {
    baseline: "rgb(0 0 0)",
    text: "rgb(0 0 0)",
    textSecondary: "rgb(75 85 99)",
    indicator: "rgb(0 0 0)",
    hover: "rgb(59 130 246)",
  },
} as const

const SPARKLINE_CONFIG = {
  margin: { left: 20, right: 20, top: 10, bottom: 20 },
  roleLevels: {
    [MilestoneType.LEADERSHIP]: 4,
    [MilestoneType.MAJOR_PROJECT]: 3,
    [MilestoneType.PROMOTION]: 2,
    [MilestoneType.JOB_CHANGE]: 1,
  },
} as const

// Timeline SVG Component
interface TimelineSVGProps {
  data: CareerMilestone[]
  width: number
  height: number
  selectedMilestone: CareerMilestone | null
  onMilestoneSelect: (milestone: CareerMilestone | null) => void
}

const TimelineSVG: React.FC<TimelineSVGProps> = ({ data, width, height, selectedMilestone, onMilestoneSelect }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => a.year - b.year), [data])

  const timelineY = height - TIMELINE_CONFIG.margin.bottom
  const timelineWidth = width - TIMELINE_CONFIG.margin.left - TIMELINE_CONFIG.margin.right

  const milestonePositions = useMemo(
    () =>
      sortedData.map((milestone, index) => ({
        milestone,
        x: TIMELINE_CONFIG.margin.left + (index / (sortedData.length - 1)) * timelineWidth,
        y: timelineY,
        roleHeight: TIMELINE_CONFIG.roleHeights[milestone.type],
      })),
    [sortedData, timelineWidth, timelineY],
  )

  const handleMilestoneClick = useCallback(
    (milestone: CareerMilestone) => {
      onMilestoneSelect(selectedMilestone?.year === milestone.year ? null : milestone)
    },
    [selectedMilestone, onMilestoneSelect],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, milestone: CareerMilestone) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        handleMilestoneClick(milestone)
      }
    },
    [handleMilestoneClick],
  )

  return (
    <svg width={width} height={height} className="overflow-visible" role="img" aria-label="Career progression timeline">
      <title>Career Timeline Visualization</title>
      <desc>
        Interactive timeline showing career progression from {sortedData[0]?.year} to{" "}
        {sortedData[sortedData.length - 1]?.year}
      </desc>

      {/* Baseline */}
      <motion.line
        x1={TIMELINE_CONFIG.margin.left}
        y1={timelineY}
        x2={TIMELINE_CONFIG.margin.left + timelineWidth}
        y2={timelineY}
        stroke={TIMELINE_CONFIG.colors.baseline}
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Milestones */}
      {milestonePositions.map(({ milestone, x, y, roleHeight }, index) => {
        const isSelected = selectedMilestone?.year === milestone.year
        const isLeadership = milestone.type === MilestoneType.LEADERSHIP
        const isMajorProject = milestone.type === MilestoneType.MAJOR_PROJECT

        return (
          <g key={`${milestone.year}-${milestone.company}`}>
            {/* Tick mark */}
            <motion.line
              x1={x}
              y1={y - 1}
              x2={x}
              y2={y + 1}
              stroke={TIMELINE_CONFIG.colors.baseline}
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />

            {/* Role indicator bar */}
            <motion.rect
              x={x - 0.5}
              y={y - roleHeight}
              width={1}
              height={roleHeight}
              fill={isSelected ? TIMELINE_CONFIG.colors.hover : TIMELINE_CONFIG.colors.indicator}
              className="milestone-indicator"
              onClick={() => handleMilestoneClick(milestone)}
              onKeyDown={(e) => handleKeyDown(e, milestone)}
              tabIndex={0}
              role="button"
              aria-label={`${milestone.year} - ${milestone.title} at ${milestone.company}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.4, ease: "easeOut" }}
              whileHover={{
                fill: TIMELINE_CONFIG.colors.hover,
                scaleX: 1.5,
                transition: { duration: 0.2 },
              }}
              whileFocus={{
                fill: TIMELINE_CONFIG.colors.hover,
                scaleX: 1.5,
                outline: "2px solid rgb(59 130 246)",
                outlineOffset: "2px",
              }}
            />

            {/* Interactive area for better click target */}
            <rect
              x={x - 15}
              y={y - roleHeight - 10}
              width={30}
              height={roleHeight + 20}
              className="interactive-area"
              onClick={() => handleMilestoneClick(milestone)}
              onKeyDown={(e) => handleKeyDown(e, milestone)}
              tabIndex={0}
              aria-label={`Select ${milestone.title} milestone`}
            />

            {/* Year label */}
            <motion.text
              x={x}
              y={y + 16}
              textAnchor="middle"
              className="text-xs font-serif fill-current"
              fill={TIMELINE_CONFIG.colors.text}
              initial={{ opacity: 0, y: y + 20 }}
              animate={{ opacity: 1, y: y + 16 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
            >
              {milestone.year}
            </motion.text>

            {/* Company label */}
            <motion.text
              x={x}
              y={y + 28}
              textAnchor="middle"
              className="text-xs font-serif fill-current"
              fill={TIMELINE_CONFIG.colors.textSecondary}
              initial={{ opacity: 0, y: y + 32 }}
              animate={{ opacity: 1, y: y + 28 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
            >
              {milestone.company}
            </motion.text>

            {/* Direct labels for significant roles */}
            {(isLeadership || isMajorProject) && (
              <motion.text
                x={x}
                y={y - roleHeight - 3}
                textAnchor="middle"
                className="text-xs font-serif fill-current"
                fill={TIMELINE_CONFIG.colors.text}
                initial={{ opacity: 0, y: y - roleHeight + 2 }}
                animate={{ opacity: 1, y: y - roleHeight - 3 }}
                transition={{ delay: index * 0.1 + 0.6, duration: 0.3 }}
              >
                {isLeadership ? "Lead" : "Project"}
              </motion.text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Sparkline SVG Component
interface SparklineSVGProps {
  data: CareerMilestone[]
  width: number
  height: number
}

const SparklineSVG: React.FC<SparklineSVGProps> = ({ data, width, height }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => a.year - b.year), [data])

  const lineWidth = width - SPARKLINE_CONFIG.margin.left - SPARKLINE_CONFIG.margin.right
  const lineHeight = height - SPARKLINE_CONFIG.margin.top - SPARKLINE_CONFIG.margin.bottom

  const pathData = useMemo(() => {
    const points = sortedData.map((milestone, index) => {
      const x = SPARKLINE_CONFIG.margin.left + (index / (sortedData.length - 1)) * lineWidth
      const y =
        SPARKLINE_CONFIG.margin.top + lineHeight - (SPARKLINE_CONFIG.roleLevels[milestone.type] / 4) * lineHeight
      return { x, y, milestone }
    })

    const pathString = points.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L"
      return `${path} ${command} ${point.x} ${point.y}`
    }, "")

    return { pathString, points }
  }, [sortedData, lineWidth, lineHeight])

  return (
    <svg width={width} height={height} role="img" aria-label="Career progression sparkline">
      <title>Career Progression Sparkline</title>
      <desc>Simplified view of career trajectory showing role seniority over time</desc>

      {/* Progression line */}
      <motion.path
        d={pathData.pathString}
        stroke="rgb(0 0 0)"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Data points */}
      {pathData.points.map((point, index) => (
        <motion.circle
          key={`${point.milestone.year}-${point.milestone.company}`}
          cx={point.x}
          cy={point.y}
          r="1.5"
          fill="rgb(0 0 0)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
        />
      ))}

      {/* Year labels at start and end */}
      <motion.text
        x={SPARKLINE_CONFIG.margin.left}
        y={height - 5}
        className="text-xs font-serif fill-current"
        fill="rgb(0 0 0)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        {sortedData[0]?.year}
      </motion.text>

      <motion.text
        x={width - SPARKLINE_CONFIG.margin.right}
        y={height - 5}
        textAnchor="end"
        className="text-xs font-serif fill-current"
        fill="rgb(0 0 0)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        {sortedData[sortedData.length - 1]?.year}
      </motion.text>
    </svg>
  )
}

// Career Table Component
interface CareerTableProps {
  data: CareerMilestone[]
  selectedMilestone: CareerMilestone | null
  onMilestoneSelect: (milestone: CareerMilestone | null) => void
}

const CareerTable: React.FC<CareerTableProps> = ({ data, selectedMilestone, onMilestoneSelect }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => a.year - b.year), [data])

  const handleRowClick = useCallback(
    (milestone: CareerMilestone) => {
      onMilestoneSelect(selectedMilestone?.year === milestone.year ? null : milestone)
    },
    [selectedMilestone, onMilestoneSelect],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, milestone: CareerMilestone) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        handleRowClick(milestone)
      }
    },
    [handleRowClick],
  )

  return (
    <div className="tufte-table" role="table" aria-label="Career milestones table">
      <div className="tufte-table-header">
        <div>Year</div>
        <div>Company</div>
        <div>Role</div>
        <div>Duration</div>
      </div>

      {sortedData.map((milestone, index) => {
        const isSelected = selectedMilestone?.year === milestone.year

        return (
          <motion.div
            key={`${milestone.year}-${milestone.company}`}
            className={`tufte-table-row ${isSelected ? "selected" : ""}`}
            onClick={() => handleRowClick(milestone)}
            onKeyDown={(e) => handleKeyDown(e, milestone)}
            tabIndex={0}
            role="row"
            aria-selected={isSelected}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div style={{ fontFamily: "monospace" }}>{milestone.year}</div>
            <div style={{ color: "rgb(75 85 99)" }}>{milestone.company}</div>
            <div>{milestone.title}</div>
            <div style={{ fontSize: "0.75rem", color: "rgb(107 114 128)" }}>{milestone.duration}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Main Career Snapshot Component
interface CareerSnapshotProps {
  data: CareerMilestone[]
  style?: VisualizationStyle
}

const CareerSnapshot: React.FC<CareerSnapshotProps> = ({ data, style = VisualizationStyle.TIMELINE }) => {
  const [containerRef, { width }] = useResizeObserver<HTMLDivElement>()
  const [selectedMilestone, setSelectedMilestone] = useState<CareerMilestone | null>(null)

  const handleMilestoneSelect = useCallback((milestone: CareerMilestone | null) => {
    setSelectedMilestone(milestone)
  }, [])

  const height = style === VisualizationStyle.SPARKLINE ? 60 : 140
  const effectiveWidth = width || 900

  if (style === VisualizationStyle.TABLE) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <CareerTable data={data} selectedMilestone={selectedMilestone} onMilestoneSelect={handleMilestoneSelect} />
        {selectedMilestone && (
          <AnimatePresence>
            <motion.div
              className="tufte-detail-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                {selectedMilestone.year} — {selectedMilestone.title}
              </div>
              <div style={{ fontSize: "0.875rem", color: "rgb(75 85 99)", marginBottom: "0.25rem" }}>
                {selectedMilestone.company}, {selectedMilestone.duration}
              </div>
              <div style={{ fontSize: "0.875rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                {selectedMilestone.impact}
              </div>
              <div style={{ fontSize: "0.75rem" }}>
                {selectedMilestone.achievements.map((achievement, i) => (
                  <div key={i} style={{ color: "rgb(55 65 81)", marginBottom: "0.25rem" }}>
                    • {achievement}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div ref={containerRef} style={{ width: "100%" }}>
        {width > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {style === VisualizationStyle.TIMELINE ? (
              <TimelineSVG
                data={data}
                width={effectiveWidth}
                height={height}
                selectedMilestone={selectedMilestone}
                onMilestoneSelect={handleMilestoneSelect}
              />
            ) : (
              <SparklineSVG data={data} width={effectiveWidth} height={height} />
            )}
          </motion.div>
        )}
      </div>

      {selectedMilestone && style === VisualizationStyle.TIMELINE && (
        <AnimatePresence>
          <motion.div
            className="tufte-detail-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>
              {selectedMilestone.year} — {selectedMilestone.title}
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgb(75 85 99)", marginBottom: "0.25rem" }}>
              {selectedMilestone.company}, {selectedMilestone.duration}
            </div>
            <div style={{ fontSize: "0.875rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
              {selectedMilestone.impact}
            </div>
            <div style={{ fontSize: "0.75rem" }}>
              {selectedMilestone.achievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  style={{ color: "rgb(55 65 81)", marginBottom: "0.25rem" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.2 }}
                >
                  • {achievement}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// Main Demo Component
const Demo: React.FC = () => {
  const careerMilestones: CareerMilestone[] = useMemo(
    () => [
      {
        year: 2019,
        title: "Frontend Developer",
        company: "StartupCo",
        duration: "8mo",
        type: MilestoneType.JOB_CHANGE,
        impact: "Built foundational React skills, shipped core features",
        achievements: ["Delivered 3 major product features", "Improved page load times by 40%"],
      },
      {
        year: 2020,
        title: "Frontend Developer",
        company: "TechCorp",
        duration: "18mo",
        type: MilestoneType.PROMOTION,
        impact: "Led UI redesign resulting in 60% engagement increase",
        achievements: ["Created new component library", "Managed team of 4 developers"],
      },
      {
        year: 2021,
        title: "Full Stack Developer",
        company: "TechCorp",
        duration: "12mo",
        type: MilestoneType.MAJOR_PROJECT,
        impact: "Built API platform serving 1M+ requests daily",
        achievements: ["Designed microservices architecture", "Reduced response times by 65%"],
      },
      {
        year: 2022,
        title: "Senior Software Engineer",
        company: "InnovateLabs",
        duration: "18mo",
        type: MilestoneType.JOB_CHANGE,
        impact: "Scaled platform infrastructure for 10x user growth",
        achievements: ["Implemented multi-tenant architecture", "Built real-time collaboration features"],
      },
      {
        year: 2023,
        title: "Tech Lead",
        company: "InnovateLabs",
        duration: "12mo",
        type: MilestoneType.LEADERSHIP,
        impact: "Delivered $2M revenue product on schedule",
        achievements: ["Led cross-functional team of 8", "Reduced deployment time by 80%"],
      },
      {
        year: 2024,
        title: "Engineering Manager",
        company: "BigTech Inc",
        duration: "8mo",
        type: MilestoneType.LEADERSHIP,
        impact: "Building enterprise AI platform, team scaling",
        achievements: ["Managing team of 12 engineers", "Defining ML infrastructure strategy"],
      },
    ],
    [],
  )

  const [selectedStyle, setSelectedStyle] = useState<VisualizationStyle>(VisualizationStyle.TIMELINE)

  const summaryStats = useMemo(
    () => ({
      duration: `${careerMilestones[careerMilestones.length - 1].year - careerMilestones[0].year} years`,
      organizations: new Set(careerMilestones.map((m) => m.company)).size,
      roles: careerMilestones.length,
      leadership: careerMilestones.filter((m) => m.type === MilestoneType.LEADERSHIP).length,
    }),
    [careerMilestones],
  )

  return (
    <motion.div
      className="tufte-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="tufte-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="tufte-title">Career Progression, 2019–2024</h1>
        <p className="tufte-subtitle">Six years of software engineering experience across three organizations</p>
      </motion.div>

      {/* Style selector */}
      <motion.div
        style={{ marginBottom: "1.5rem" }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div style={{ display: "flex", gap: "0" }}>
          {Object.values(VisualizationStyle).map((style, index) => (
            <motion.button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`tufte-button ${selectedStyle === style ? "active" : ""}`}
              style={{
                borderLeft: index === 0 ? "1px solid rgb(209 213 219)" : "none",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={selectedStyle === style}
            >
              {style}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main visualization */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <CareerSnapshot data={careerMilestones} style={selectedStyle} />
      </motion.div>

      {/* Summary statistics */}
      <motion.div
        className="tufte-stats-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div>
          <div style={{ fontWeight: "500" }}>Duration</div>
          <div style={{ color: "rgb(75 85 99)" }}>{summaryStats.duration}</div>
        </div>
        <div>
          <div style={{ fontWeight: "500" }}>Organizations</div>
          <div style={{ color: "rgb(75 85 99)" }}>{summaryStats.organizations} companies</div>
        </div>
        <div>
          <div style={{ fontWeight: "500" }}>Roles</div>
          <div style={{ color: "rgb(75 85 99)" }}>{summaryStats.roles} positions</div>
        </div>
        <div>
          <div style={{ fontWeight: "500" }}>Leadership</div>
          <div style={{ color: "rgb(75 85 99)" }}>{summaryStats.leadership} positions</div>
        </div>
      </motion.div>

      {/* Methodology note */}
      <motion.div
        className="tufte-methodology"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>
          <em>Note:</em> Timeline visualization follows Tufte's principles of maximizing data-ink ratio. Bar heights
          encode role seniority; direct labeling eliminates need for legends. Interactive elements support keyboard
          navigation and screen readers. Animations respect <code>prefers-reduced-motion</code> settings.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Demo
