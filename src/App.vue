<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import questionShowcase from './data/questionShowcase.json'
import {
  failureCases,
  failurePatterns,
  failureSections,
  type FailureCase,
  type FailureCategory,
} from './data/failureAnalysis'

type NavItem = {
  label: string
  target: string
}

type Stat = {
  value: string
  label: string
}

type BenchmarkResult = {
  name: string
  group: string
  score: number
  note: string
  tone: 'human' | 'leader' | 'open' | 'vision' | 'audio' | 'text' | 'muted'
}

type ShowcaseOption = {
  letter: string
  text: string
}

type ShowcaseExample = {
  questionId: string
  videoId: string
  videoUrl: string
  startTime: string
  endTime: string
  domain: string
  subdomain: string
  questionType: string[]
  channelName: string | null
  question: string
  answer: string
  correctOptionLetter: string
  correctOptionText: string
  options: ShowcaseOption[]
}

const navigation: NavItem[] = [
  { label: 'Abstract', target: '#abstract' },
  { label: 'Figure', target: '#figure-1' },
  { label: 'Benchmark', target: '#benchmark' },
  { label: 'Examples', target: '#examples' },
  { label: 'Failure Cases', target: '#failure-cases' },
  { label: 'Leaderboard', target: '#leaderboard' },
]

const colorModeSelectUi = {
  base: 'mode-select-trigger',
  value: 'mode-select-value',
  placeholder: 'mode-select-placeholder',
  leadingIcon: 'mode-select-icon',
  trailingIcon: 'mode-select-icon',
  itemLeadingIcon: 'mode-select-icon',
  content: 'mode-select-content',
  item: 'mode-select-item',
} as const

let previousScrollRestoration: ScrollRestoration | null = null

const activeSection = ref(navigation[0]?.target ?? '#abstract')
const showcaseExamples = questionShowcase as ShowcaseExample[]
const activeShowcaseIndex = ref(0)
const defaultFailureSection = failureSections[0]!
const activeFailureCategory = ref<FailureCategory>(defaultFailureSection.category)
const activeFailureCaseIndices = ref<Record<FailureCategory, number>>({
  both_wrong: 0,
  qwen_wrong: 0,
  gemini_wrong: 0,
})

const benchmarkStats: Stat[] = [
  { value: '5,000', label: 'QA pairs' },
  { value: '2,628', label: 'web videos' },
  { value: '656.0s', label: 'avg. duration' },
  { value: '380.3s', label: 'avg. answer pos.' },
  { value: '10', label: 'domains' },
  { value: '36', label: 'subcategories' },
  { value: '13', label: 'skills' },
]

const reviewNotice =
  'Author names, affiliations, contact information, and release links are intentionally omitted in this review version.'

const reviewResourcesNotice =
  'External paper and dataset links are withheld on this page to preserve double-blind review anonymity.'

const results: BenchmarkResult[] = [
  {
    name: 'Human',
    group: 'Reference upper bound',
    score: 84.3,
    note: 'People clear this benchmark by a wide margin; no model comes close.',
    tone: 'human',
  },
  {
    name: 'Gemini 2.5 Pro',
    group: 'Best closed-source audio-visual MLLM',
    score: 57.5,
    note: 'The top-performing system in our evaluation, yet still 26.8 points behind human accuracy.',
    tone: 'leader',
  },
  {
    name: 'Gemini 2.5 Flash',
    group: 'Closed-source audio-visual MLLM',
    score: 55.2,
    note: 'A close second among closed-source systems, trailing Gemini 2.5 Pro by just 2.3 points.',
    tone: 'leader',
  },
  {
    name: 'GPT-5.2',
    group: 'Text-only baseline',
    score: 40.7,
    note: 'Strong for a text-only system, but language alone cannot substitute for watching and listening to the video.',
    tone: 'text',
  },
  {
    name: 'Qwen3-VL-32B-Instruct',
    group: 'Best vision-only baseline',
    score: 38.3,
    note: 'The best vision-only result we recorded, but without audio, key evidence frequently goes undetected.',
    tone: 'vision',
  },
  {
    name: 'Qwen3-Omni-30B-A3B-Instruct',
    group: 'Best open-source audio-visual MLLM',
    score: 36.3,
    note: 'The leading open-source audio-visual model, scoring 21.2 points below the top closed-source system.',
    tone: 'open',
  },
  {
    name: 'Qwen3-(VL+O-A) + GPT-5.2',
    group: 'Best cascaded baseline',
    score: 35.9,
    note: 'Fusing captions into a strong text model is outpaced by end-to-end multimodal inference.',
    tone: 'muted',
  },
  {
    name: 'Qwen3-Omni-30B-A3B-Thinking',
    group: 'Open-source audio-visual MLLM',
    score: 35.8,
    note: 'Marginally behind the instruct variant; the thinking mode offers little benefit here.',
    tone: 'open',
  },
  {
    name: 'Qwen3-Omni-30B-A3B',
    group: 'Best audio-only baseline',
    score: 35.6,
    note: 'When answers require visual grounding, audio alone falls short.',
    tone: 'audio',
  },
  {
    name: 'Qwen3-235B',
    group: 'Text-only baseline',
    score: 32.6,
    note: 'Even at 235B parameters, text-only inference cannot bridge the gap to genuine audio-visual understanding.',
    tone: 'text',
  },
  {
    name: 'Qwen3-(VL+O-A) + Qwen3-235B',
    group: 'Cascaded baseline',
    score: 32.3,
    note: 'Caption-augmented inference improves over pure text, but does not catch up to native multimodal models.',
    tone: 'muted',
  },
  {
    name: 'Qwen3-VL-8B-Instruct',
    group: 'Vision-only baseline',
    score: 31.3,
    note: 'Competitive given its size, but audio-dependent questions remain a clear blind spot.',
    tone: 'vision',
  },
  {
    name: 'Qwen2.5-Omni-7B',
    group: 'Open-source audio-visual MLLM',
    score: 29.1,
    note: 'A compact omni model, functional but well behind the top-tier systems.',
    tone: 'open',
  },
  {
    name: 'Phi-4 Multimodal',
    group: 'Open-source audio-visual MLLM',
    score: 28.3,
    note: 'Sits in the middle of the open-source pack on this benchmark.',
    tone: 'open',
  },
  {
    name: 'Qwen2.5-VL-7B-Instruct',
    group: 'Vision-only baseline',
    score: 24.6,
    note: 'An earlier vision-only model that falls significantly behind joint audio-visual systems.',
    tone: 'vision',
  },
  {
    name: 'Gemma 3n',
    group: 'Open-source audio-visual MLLM',
    score: 24.4,
    note: 'Handles shorter clips reasonably well, but performance drops on longer, more demanding videos.',
    tone: 'open',
  },
  {
    name: 'GPT-4o mini',
    group: 'Text-only baseline',
    score: 23.8,
    note: 'Further evidence that text-only reasoning cannot substitute for audio-visual grounding.',
    tone: 'text',
  },
  {
    name: 'MiniCPM',
    group: 'Open-source audio-visual MLLM',
    score: 21.2,
    note: 'Lightweight architecture, limited performance on long-form content.',
    tone: 'open',
  },
  {
    name: 'OmniVinci',
    group: 'Open-source audio-visual MLLM',
    score: 20.9,
    note: 'A unified omni-modal system, though it trails the stronger baselines by a notable margin.',
    tone: 'open',
  },
  {
    name: 'Video-LLaMA 2',
    group: 'Open-source audio-visual MLLM',
    score: 20.7,
    note: 'One of the earlier audio-visual models; the performance gap to newer systems is substantial.',
    tone: 'open',
  },
  {
    name: 'Baichuan-Omni-1.5',
    group: 'Open-source audio-visual MLLM',
    score: 20.1,
    note: 'Shows how demanding MMOU is for open-source architectures at this scale.',
    tone: 'open',
  },
  {
    name: 'Ming-Lite-Omni-1.5',
    group: 'Open-source audio-visual MLLM',
    score: 17.8,
    note: 'Among the lowest scores in our evaluation; the benchmark proves difficult even for recent lightweight models.',
    tone: 'open',
  },
  {
    name: 'Audio Flamingo 3',
    group: 'Audio-only baseline',
    score: 15.6,
    note: 'Questions that need visual grounding are largely out of reach for audio-only models.',
    tone: 'muted',
  },
]

const heroResults = results.filter((item) =>
  ['Human', 'Gemini 2.5 Pro', 'Qwen3-Omni-30B-A3B-Instruct'].includes(item.name),
)

const activeShowcase = computed(
  () => showcaseExamples[activeShowcaseIndex.value] ?? showcaseExamples[0],
)

const failureCasesByCategory = computed<Record<FailureCategory, FailureCase[]>>(() => ({
  both_wrong: failureCases.filter((item) => item.category === 'both_wrong'),
  qwen_wrong: failureCases.filter((item) => item.category === 'qwen_wrong'),
  gemini_wrong: failureCases.filter((item) => item.category === 'gemini_wrong'),
}))

const activeFailureSection = computed(
  () =>
    failureSections.find((item) => item.category === activeFailureCategory.value) ??
    defaultFailureSection,
)

const activeFailureCases = computed(
  () => failureCasesByCategory.value[activeFailureCategory.value] ?? [],
)

const failureCaseCount = (category: FailureCategory) =>
  failureCasesByCategory.value[category]?.length ?? 0

const activeFailureCase = computed(
  () =>
    activeFailureCases.value[activeFailureCaseIndices.value[activeFailureCategory.value]] ??
    activeFailureCases.value[0],
)

const setActiveFailureCaseIndex = (category: FailureCategory, index: number) => {
  activeFailureCaseIndices.value = {
    ...activeFailureCaseIndices.value,
    [category]: index,
  }
}

const formatFailureLabel = (label: string) =>
  label
    .toLowerCase()
    .replace(/(^|[\s-/])([a-z])/g, (_, prefix: string, char: string) => `${prefix}${char.toUpperCase()}`)
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bAv\b/g, 'AV')

const failureThemeBadgeClass = (theme: 'danger' | 'warning' | 'info') => {
  switch (theme) {
    case 'danger':
      return 'border-[rgb(180_79_54_/_0.18)] bg-[rgb(180_79_54_/_0.1)] text-[#9c3f25] dark:border-[rgb(240_167_86_/_0.24)] dark:bg-[rgb(240_167_86_/_0.12)] dark:text-[#ffd0a6]'
    case 'warning':
      return 'border-[rgb(217_145_60_/_0.18)] bg-[rgb(217_145_60_/_0.12)] text-[#9b641f] dark:border-[rgb(240_167_86_/_0.24)] dark:bg-[rgb(240_167_86_/_0.12)] dark:text-[#ffd0a6]'
    case 'info':
      return 'border-[rgb(47_111_214_/_0.18)] bg-[rgb(47_111_214_/_0.1)] text-[#2f6fd6] dark:border-[rgb(105_170_255_/_0.22)] dark:bg-[rgb(105_170_255_/_0.12)] dark:text-[#b9d4ff]'
  }
}

const failureAnswerRowClass = (state: 'truth' | 'correct' | 'wrong') => {
  switch (state) {
    case 'truth':
      return 'bg-[rgb(18_122_120_/_0.08)] dark:bg-[rgb(50_179_171_/_0.14)]'
    case 'correct':
      return 'bg-[rgb(18_122_120_/_0.06)] dark:bg-[rgb(50_179_171_/_0.12)]'
    case 'wrong':
      return 'bg-[rgb(180_79_54_/_0.06)] dark:bg-[rgb(217_108_76_/_0.14)]'
  }
}

const updateActiveSection = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const probe = window.innerHeight * 0.32
  let currentTarget = navigation[0]?.target ?? '#abstract'

  for (const item of navigation) {
    const section = document.querySelector<HTMLElement>(item.target)

    if (!section) {
      continue
    }

    if (section.getBoundingClientRect().top <= probe) {
      currentTarget = item.target
    }
  }

  activeSection.value = currentTarget
}

const jumpTo = (target: string) => {
  if (typeof document === 'undefined') {
    return
  }

  activeSection.value = target

  document.querySelector(target)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const scoreStyle = (score: number) => ({ width: `${score}%` })

const timestampToSeconds = (value: string) =>
  value
    .split(':')
    .map((part) => Number(part))
    .reduce((total, part) => total * 60 + (Number.isFinite(part) ? part : 0), 0)

const embedUrl = (item: ShowcaseExample) => {
  const start = timestampToSeconds(item.startTime)
  const params = [`start=${start}`, 'rel=0', 'modestbranding=1']

  return `https://www.youtube-nocookie.com/embed/${item.videoId}?${params.join('&')}`
}

const resetInitialScroll = () => {
  if (typeof window === 'undefined') {
    return
  }

  if ('scrollRestoration' in window.history) {
    previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
  }

  if (window.location.hash) {
    return
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0 })
    updateActiveSection()
  })
}

onMounted(() => {
  resetInitialScroll()
  updateActiveSection()
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('resize', updateActiveSection)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && previousScrollRestoration) {
    window.history.scrollRestoration = previousScrollRestoration
  }

  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('resize', updateActiveSection)
})
</script>

<template>
  <UApp>
    <div class="site-shell">
      <div class="ambient-backdrop" aria-hidden="true">
        <div class="ambient-backdrop__layer ambient-backdrop__layer--orbits"></div>
        <div class="ambient-backdrop__layer ambient-backdrop__layer--constellation"></div>
        <div class="ambient-backdrop__layer ambient-backdrop__layer--waveform"></div>
        <div class="ambient-backdrop__layer ambient-backdrop__layer--timeline"></div>
        <div class="ambient-backdrop__layer ambient-backdrop__layer--signals"></div>
      </div>

      <header class="fixed inset-x-0 top-3 z-[60] px-4 sm:px-6 lg:px-8">
        <div
          class="chrome-panel mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full px-4 py-2 sm:px-6">
          <button type="button" class="brand-button flex items-center gap-3 text-left" @click="jumpTo('#abstract')">
            <img src="/images/logo.webp" alt="MMOU logo" class="h-11 w-auto object-contain sm:h-12">
            <div class="hidden sm:block">
              <p class="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">MMOU</p>
              <p class="text-sm font-semibold text-[var(--ink)]">Omni Understanding and Reasoning</p>
            </div>
          </button>

          <nav class="hidden items-center gap-2 lg:flex">
            <button v-for="item in navigation" :key="item.target" type="button"
              :class="['nav-link', { 'nav-link-active': activeSection === item.target }]"
              :aria-current="activeSection === item.target ? 'page' : undefined" @click="jumpTo(item.target)">
              {{ item.label }}
            </button>
          </nav>

          <div class="flex items-center gap-2">
            <UColorModeSelect color="neutral" variant="outline" size="xs" class="mode-select w-[6.75rem] sm:w-[7.25rem]"
              :content="{ side: 'bottom', align: 'end', sideOffset: 10 }" :ui="colorModeSelectUi" />
          </div>
        </div>
      </header>

      <main class="pt-[5.75rem] sm:pt-24 lg:pt-28">
        <section id="abstract"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 pb-8 pt-4 sm:px-8 sm:pt-5 lg:scroll-mt-32 lg:px-12 lg:pb-10 lg:pt-6">
          <div class="mx-auto max-w-5xl">
            <UCard class="surface-card rounded-[34px] p-2">
              <div class="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                <div class="flex items-start gap-4">
                  <img src="/images/logo.webp" alt="MMOU logo" class="h-14 w-auto object-contain sm:h-16">
                  <div class="min-w-0">
                    <p class="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                      MMOU
                    </p>
                    <h1
                      class="display-font mt-2 text-4xl leading-[0.96] tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">
                      Massive Multi-Task Omni Understanding and Reasoning
                    </h1>
                  </div>
                </div>
                <div
                  class="rounded-[26px] border border-[var(--border)] bg-white/48 px-4 py-4 text-center shadow-[0_12px_36px_rgb(16_23_28_/_0.05)] dark:bg-[rgb(22_29_35_/_0.7)]">
                  <p class="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    Double-Blind Review
                  </p>
                  <p class="mt-3 text-sm/7 text-[var(--muted)] sm:text-base/7">
                    {{ reviewNotice }}
                  </p>
                </div>
                <p class="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  Abstract
                </p>
                <p class="text-base/8 text-[var(--muted)] sm:text-lg/8">
                  Multimodal LLMs have made impressive strides in visual and audio understanding, but most falter when
                  both modalities need to work together over long, real-world videos. MMOU addresses this with 5,000
                  questions spanning 2,628 web-collected videos across 10 domains, 36 subcategories, and 13 skill
                  types. Testing 20+ models, the best closed-source system reaches 57.5%, the strongest open-source
                  model reaches 36.3%, and humans score 84.3%, a gap that reveals how far current models are from
                  genuine audio-visual understanding.
                </p>
                <div class="flex flex-wrap gap-3">
                  <UButton color="neutral" class="button-fx rounded-full px-5" @click="jumpTo('#figure-1')">
                    View Figure
                  </UButton>
                  <UButton color="neutral" variant="outline"
                    class="button-fx rounded-full border-[var(--border-strong)] bg-white/65 px-5 text-[var(--ink)]"
                    @click="jumpTo('#examples')">
                    See Examples
                  </UButton>
                  <UButton color="neutral" variant="outline"
                    class="button-fx rounded-full border-[var(--border-strong)] bg-white/65 px-5 text-[var(--ink)]"
                    @click="jumpTo('#failure-cases')">
                    Failure Cases
                  </UButton>
                  <UButton color="neutral" variant="outline"
                    class="button-fx rounded-full border-[var(--border-strong)] bg-white/65 px-5 text-[var(--ink)]"
                    @click="jumpTo('#leaderboard')">
                    View Leaderboard
                  </UButton>
                </div>
                <p class="text-sm/7 text-[var(--muted)]">
                  {{ reviewResourcesNotice }}
                </p>
              </div>
            </UCard>
          </div>
        </section>

        <section id="figure-1"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 py-8 sm:px-8 lg:scroll-mt-32 lg:px-12 lg:py-10">
          <div class="section-heading reveal">
            <UBadge color="neutral" variant="soft" class="section-badge">Figure</UBadge>
            <h2 class="display-font section-title">Current models fall well short of human-level audio-visual
              understanding.</h2>
            <p class="section-copy">
              The overview figure situates MMOU within the broader multimodal landscape, showing just how far
              today's best models, open and closed, are from matching what a person can do.
            </p>
          </div>

          <UCard class="surface-card media-card mt-8 rounded-[34px] p-2">
            <figure class="space-y-4 px-2 py-2">
              <img src="/images/hero.webp"
                alt="Submission overview figure for MMOU, highlighting long and complex real-world audio-visual videos and the performance gap between human and model accuracy."
                class="w-full rounded-[26px] bg-white" loading="eager">
              <figcaption class="grid gap-4 px-2 pb-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div>
                  <p class="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">Overview figure and performance
                    gap</p>
                  <p class="mt-2 text-sm/7 text-[var(--muted)]">
                    Questions require models to integrate what they see and hear across videos that often run 10+
                    minutes. Gemini 2.5 Pro is the best-performing system at 57.5%, but sits 26.8 points below
                    humans, while the top open-source model reaches only 36.3%.
                  </p>
                </div>
                <div class="grid gap-2.5 sm:grid-cols-3">
                  <div v-for="item in heroResults" :key="item.name"
                    class="rounded-[22px] border border-[var(--border)] bg-white/72 px-4 py-4">
                    <div class="mb-2 flex items-center justify-between gap-3">
                      <p class="text-sm font-semibold text-[var(--ink)]">{{ item.name }}</p>
                      <p class="text-sm font-bold text-[var(--ink)]">{{ item.score }}%</p>
                    </div>
                    <div class="score-track">
                      <div :class="['score-fill', `score-fill--${item.tone}`]" :style="scoreStyle(item.score)" />
                    </div>
                  </div>
                </div>
              </figcaption>
            </figure>
          </UCard>
        </section>

        <section id="benchmark"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 py-8 sm:px-8 lg:scroll-mt-32 lg:px-12 lg:py-10">
          <div class="section-heading reveal">
            <UBadge color="neutral" variant="soft" class="section-badge">Benchmark</UBadge>
            <h2 class="display-font section-title">What's in the benchmark</h2>
            <p class="section-copy">
              MMOU is built around the kinds of questions that are easy for people but hard for machines: ones
              where the answer depends on picking up a subtle audio cue, noticing a visual detail from early in a
              video, or connecting both. It contains 5,000 multiple-choice QAs drawn from 2,628 web videos, with
              answer evidence scattered throughout rather than front-loaded or saved for the end.
            </p>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="stat in benchmarkStats" :key="stat.label" class="metric-pill reveal rounded-[24px] px-4 py-4">
              <p class="text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">{{ stat.value }}</p>
              <p class="mt-1 text-sm font-medium text-[var(--muted)]">{{ stat.label }}</p>
            </div>
          </div>

          <div class="mt-4">
            <UCard class="surface-card media-card rounded-[30px] p-2">
              <figure class="space-y-5 px-4 py-4">
                <img src="/images/domains_skills.webp"
                  alt="Composite MMOU benchmark figure showing video category distribution, reasoning skill co-occurrence, relative answer position, question distribution across skills, and video duration distribution."
                  loading="lazy" class="w-full rounded-[24px] bg-white">
                <figcaption class="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                  <div>
                    <p class="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
                      Domain coverage, skill overlap, answer timing, and video length
                    </p>
                    <p class="mt-2 text-sm/7 text-[var(--muted)]">
                      Four panels capture the shape of the benchmark: which topics the videos cover, how often
                      multiple skills appear in a single question, where in the video the answer can be found, and
                      how clip lengths vary.
                    </p>
                  </div>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Domains</p>
                      <p class="mt-2 text-sm/7 text-[var(--ink)]">
                        Ten major categories, 36 subcategories: from academic lectures and sports to music, news,
                        animation, and everyday footage.
                      </p>
                    </div>
                    <div class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Skill mix</p>
                      <p class="mt-2 text-sm/7 text-[var(--ink)]">
                        Questions draw on up to 13 skill types and average 3 per QA. Compound reasoning is the
                        default, not a special case.
                      </p>
                    </div>
                    <div class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Construction</p>
                      <p class="mt-2 text-sm/7 text-[var(--ink)]">
                        Annotators write open-ended QA pairs in multiple rounds; a separate expert pass removes
                        ambiguous items before everything is converted to 10-option multiple choice.
                      </p>
                    </div>
                    <div class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Timeline</p>
                      <p class="mt-2 text-sm/7 text-[var(--ink)]">
                        Answer evidence lands at 380.3 seconds on average. Source clips range from 30 seconds to
                        84 minutes, requiring models to track context across the full video.
                      </p>
                    </div>
                  </div>
                </figcaption>
              </figure>
            </UCard>
          </div>
        </section>

        <section id="examples"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 py-8 sm:px-8 lg:scroll-mt-32 lg:px-12 lg:py-10">
          <div class="section-heading reveal">
            <UBadge color="neutral" variant="soft" class="section-badge">Examples</UBadge>
            <h2 class="display-font section-title">See what MMOU questions actually look like</h2>
            <p class="section-copy">
              Each example pairs a video clip with a 10-option question whose answer may hinge on audio, visuals,
              or both, sometimes at a specific moment and sometimes across the whole clip.
            </p>
          </div>

          <div class="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <button v-for="(item, index) in showcaseExamples" :key="item.questionId" type="button"
              :class="['showcase-button', 'button-fx', 'h-full', 'text-left', { 'showcase-button-active': activeShowcaseIndex === index }]"
              @click="activeShowcaseIndex = index">
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Example {{ String(index + 1).padStart(2, '0') }}
              </p>
              <p class="mt-1.5 text-sm font-semibold leading-5 text-[var(--ink)]">{{ item.domain }}</p>
              <p class="mt-0.5 text-xs leading-5 text-[var(--muted)]">{{ item.subdomain }}</p>
            </button>
          </div>

          <UCard v-if="activeShowcase" class="surface-card mt-5 rounded-[28px] p-2">
            <div
              class="grid gap-5 px-4 py-4 sm:px-5 sm:py-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] xl:items-start">
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Question</p>
                  <h3 class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
                    {{ activeShowcase.question }}
                  </h3>
                </div>

                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Options</p>
                  <div class="mt-3 grid gap-2.5 md:grid-cols-2">
                    <div v-for="option in activeShowcase.options" :key="option.letter"
                      :class="['showcase-option', { 'showcase-option--correct': option.letter === activeShowcase.correctOptionLetter }]">
                      <div class="flex items-start gap-2.5">
                        <span class="showcase-option__letter">{{ option.letter }}</span>
                        <div>
                          <p class="text-sm/6 font-medium text-[var(--ink)]">{{ option.text }}</p>
                          <p v-if="option.letter === activeShowcase.correctOptionLetter"
                            class="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                            Correct option
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {{ activeShowcase.domain }}
                    </span>
                    <span
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {{ activeShowcase.subdomain }}
                    </span>
                    <span v-if="activeShowcase.channelName"
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {{ activeShowcase.channelName }}
                    </span>
                    <span
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {{ activeShowcase.startTime }}-{{ activeShowcase.endTime }}
                    </span>
                  </div>

                  <div v-if="activeShowcase.questionType.length" class="flex flex-wrap gap-2">
                    <span v-for="type in activeShowcase.questionType" :key="type"
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                      {{ type }}
                    </span>
                  </div>
                </div>

                <div>
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Example clip</p>
                    <a :href="activeShowcase.videoUrl" target="_blank" rel="noreferrer"
                      class="text-sm font-semibold text-[var(--accent-strong)] hover:underline">
                      Open on YouTube
                    </a>
                  </div>
                  <div class="mt-3 aspect-video overflow-hidden rounded-[22px] border border-[var(--border)] bg-black">
                    <iframe :src="embedUrl(activeShowcase)" :title="`MMOU example ${activeShowcase.videoId}`"
                      class="h-full w-full" loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowfullscreen referrerpolicy="strict-origin-when-cross-origin" />
                  </div>
                </div>

                <div class="rounded-[20px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Ground-truth answer
                  </p>
                  <p class="mt-2 text-sm/7 text-[var(--ink)]">{{ activeShowcase.answer }}</p>
                  <p class="mt-2 text-sm/6 text-[var(--muted)]">
                    Correct choice: {{ activeShowcase.correctOptionLetter }}. {{ activeShowcase.correctOptionText }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <section id="failure-cases"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 py-8 sm:px-8 lg:scroll-mt-32 lg:px-12 lg:py-10">
          <div class="section-heading reveal">
            <UBadge color="neutral" variant="soft" class="section-badge">Supplementary</UBadge>
            <h2 class="display-font section-title">Failure Case Analysis</h2>
            <p class="section-copy">
              To complement our quantitative evaluation, we present a curated set of 30 failure cases illustrating how
              state-of-the-art multimodal models fail on MMOU. Across the full benchmark, Gemini 2.5 Pro reaches
              57.5% accuracy and Qwen3-Omni-30B-A3B-Instruct reaches 36.3%. Below, we highlight representative
              examples where these models fail, organized into three categories.
            </p>
          </div>

          <UCard class="surface-card mt-8 rounded-[32px] p-2">
            <div
              class="grid gap-5 px-4 py-4 sm:px-5 sm:py-5 xl:grid-cols-[minmax(0,1.06fr)_minmax(20rem,0.94fr)] xl:items-start">
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                    Rebuttal supplement
                  </p>
                  <p class="mt-3 text-base/8 text-[var(--muted)]">
                    We organize the cases into three groups: (A) questions where both models fail and choose the same
                    wrong answer, revealing systematic shared bias; (B) questions where only Qwen3-Omni fails,
                    highlighting a capability gap in audio-visual grounding; and (C) questions where Gemini 2.5 Pro
                    fails even though Qwen3-Omni succeeds, showing that MMOU is still genuinely difficult for the
                    strongest models in our evaluation.
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span v-for="section in failureSections" :key="section.category"
                    class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {{ section.shortLabel }}
                  </span>
                </div>

              </div>

              <aside
                class="rounded-[24px] border border-[var(--border)] bg-white/72 px-4 py-4 shadow-[0_12px_36px_rgb(16_23_28_/_0.05)] dark:bg-[rgb(22_29_35_/_0.9)]">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Key insight</p>
                <h3 class="text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                  Shared errors are systematic, not random.
                </h3>
                <p class="mt-3 text-sm/7 text-[var(--muted)]">
                  When both models fail on the same question, they frequently choose the identical wrong answer,
                  revealing systematic shared biases rather than random errors. The majority of mutual failures involve
                  audio-dependent questions, indicating that current systems still struggle to align what they hear
                  with what they see.
                </p>
              </aside>
            </div>
          </UCard>

          <div class="mt-6">
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="tablist" aria-label="Failure case categories">
              <button v-for="section in failureSections" :key="section.category" type="button"
                :class="[
                  'showcase-button',
                  'button-fx',
                  'h-full',
                  'text-left',
                  { 'showcase-button-active': activeFailureCategory === section.category },
                ]" :aria-selected="activeFailureCategory === section.category"
                @click="activeFailureCategory = section.category">
                <div class="flex items-center justify-between gap-3">
                  <span
                    :class="['rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em]', failureThemeBadgeClass(section.theme)]">
                    {{ section.shortLabel }}
                  </span>
                  <span class="text-xs font-semibold text-[var(--muted)]">{{ failureCaseCount(section.category) }}</span>
                </div>
                <p class="mt-2 text-sm font-semibold leading-5 text-[var(--ink)]">{{ section.title }}</p>
              </button>
            </div>

            <UCard class="surface-card mt-3 rounded-[32px] p-2">
              <div class="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="max-w-4xl">
                    <span
                      :class="['inline-flex rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em]', failureThemeBadgeClass(activeFailureSection.theme)]">
                      {{ activeFailureSection.label }}
                    </span>
                    <h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                      {{ activeFailureSection.title }}
                    </h3>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {{ activeFailureCases.length }} curated cases
                    </span>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    <button v-for="(item, index) in activeFailureCases" :key="item.id" type="button"
                      :class="[
                        'showcase-button',
                        'button-fx',
                        'h-full',
                        'text-left',
                        '!px-3 !py-2',
                        { 'showcase-button-active': activeFailureCaseIndices[activeFailureCategory] === index },
                      ]" @click="setActiveFailureCaseIndex(activeFailureCategory, index)">
                      <div class="flex items-start gap-2">
                        <span
                          class="mt-0.5 inline-flex items-center justify-center rounded-full bg-[rgb(19_32_40_/_0.08)] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[var(--ink)]">
                          {{ item.id }}
                        </span>
                        <p class="text-[0.92rem] font-semibold leading-5 text-[var(--ink)]"
                          style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                          {{ formatFailureLabel(item.failureLabel) }}
                        </p>
                      </div>
                    </button>
                  </div>

                  <article v-if="activeFailureCase"
                    class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-3 sm:px-4 sm:py-4">
                    <div class="flex flex-col gap-3">
                      <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div class="flex flex-wrap items-center gap-2">
                            <span
                              class="inline-flex items-center justify-center rounded-full bg-[rgb(19_32_40_/_0.08)] px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[var(--ink)]">
                              {{ activeFailureCase.id }}
                            </span>
                            <h4 class="text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]">
                              {{ formatFailureLabel(activeFailureCase.failureLabel) }}
                            </h4>
                          </div>

                          <div class="mt-2 flex flex-wrap gap-2">
                            <span
                              class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              <span class="font-mono text-[0.76rem]">{{ activeFailureCase.video }}</span>
                            </span>
                            <span v-for="skill in activeFailureCase.skills" :key="skill"
                              class="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                              {{ skill }}
                            </span>
                          </div>
                        </div>

                        <span v-if="activeFailureCase.sameWrong"
                          class="inline-flex items-center gap-2 rounded-full border border-[rgb(180_79_54_/_0.18)] bg-[rgb(180_79_54_/_0.1)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#9c3f25] dark:border-[rgb(240_167_86_/_0.24)] dark:bg-[rgb(240_167_86_/_0.12)] dark:text-[#ffd0a6]">
                          <span>⚠</span>
                          Same wrong
                        </span>
                      </div>

                      <div class="rounded-[18px] border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-3">
                        <p class="text-sm/6 font-medium text-[var(--ink)]">{{ activeFailureCase.question }}</p>
                      </div>

                      <div class="overflow-x-auto rounded-[18px] border border-[var(--border)]">
                        <table class="min-w-[40rem] w-full border-collapse text-left">
                          <thead>
                            <tr class="bg-white/60 dark:bg-white/5">
                              <th scope="col"
                                class="border-b border-[var(--border)] px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                                Source
                              </th>
                              <th scope="col"
                                class="border-b border-l border-[var(--border)] px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                                Answer
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr :class="failureAnswerRowClass('truth')">
                              <th scope="row"
                                class="w-48 border-b border-[var(--border)] px-3 py-2.5 text-[0.92rem] font-semibold text-[var(--ink)]">
                                <span class="inline-flex items-center gap-2">
                                  <span>✅</span>
                                  <span>Ground Truth</span>
                                </span>
                              </th>
                              <td class="border-b border-l border-[var(--border)] px-3 py-2.5 text-[0.92rem]/6 text-[var(--ink)]">
                                <span class="mr-1 inline-block min-w-8 font-bold text-[var(--ink)]">({{ activeFailureCase.gt.letter }})</span>
                                {{ activeFailureCase.gt.text }}
                              </td>
                            </tr>
                            <tr :class="failureAnswerRowClass(activeFailureCase.gemini.correct ? 'correct' : 'wrong')">
                              <th scope="row"
                                class="w-48 border-b border-[var(--border)] px-3 py-2.5 text-[0.92rem] font-semibold text-[var(--ink)]">
                                <span class="inline-flex items-center gap-2">
                                  <span>{{ activeFailureCase.gemini.correct ? '✅' : '❌' }}</span>
                                  <span>Gemini 2.5 Pro</span>
                                </span>
                              </th>
                              <td class="border-b border-l border-[var(--border)] px-3 py-2.5 text-[0.92rem]/6 text-[var(--ink)]">
                                <span class="mr-1 inline-block min-w-8 font-bold text-[var(--ink)]">({{ activeFailureCase.gemini.letter }})</span>
                                {{ activeFailureCase.gemini.text }}
                              </td>
                            </tr>
                            <tr :class="failureAnswerRowClass(activeFailureCase.qwen.correct ? 'correct' : 'wrong')">
                              <th scope="row" class="w-48 px-3 py-2.5 text-[0.92rem] font-semibold text-[var(--ink)]">
                                <span class="inline-flex items-center gap-2">
                                  <span>{{ activeFailureCase.qwen.correct ? '✅' : '❌' }}</span>
                                  <span>Qwen3-Omni</span>
                                </span>
                              </th>
                              <td class="border-l border-[var(--border)] px-3 py-2.5 text-[0.92rem]/6 text-[var(--ink)]">
                                <span class="mr-1 inline-block min-w-8 font-bold text-[var(--ink)]">({{ activeFailureCase.qwen.letter }})</span>
                                {{ activeFailureCase.qwen.text }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div class="rounded-[18px] border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-3">
                        <p class="text-sm/6 text-[var(--ink)]">{{ activeFailureCase.analysis }}</p>
                      </div>

                    </div>
                  </article>
                </div>
              </div>
            </UCard>
          </div>

          <UCard class="surface-card mt-8 rounded-[32px] p-2">
            <div class="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <div class="max-w-4xl">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Failure taxonomy
                </p>
                <h3 class="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                  Recurring failure patterns on MMOU
                </h3>
                <p class="mt-3 text-sm/7 text-[var(--muted)]">
                  Across the curated examples above, seven patterns recur consistently. Together they suggest that
                  current models still process audio and visuals semi-independently and often default to plausible
                  narratives instead of grounded evidence.
                </p>
              </div>

              <div class="grid gap-3 lg:grid-cols-2">
                <article v-for="(pattern, index) in failurePatterns" :key="pattern.title"
                  class="rounded-[22px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                  <div class="flex gap-4">
                    <span class="step-badge">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                    <h4 class="text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">{{ pattern.title }}</h4>
                    <p class="mt-2 text-sm/7 text-[var(--muted)]">{{ pattern.description }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </UCard>
        </section>

        <section id="leaderboard"
          class="mx-auto max-w-7xl scroll-mt-28 px-6 py-8 sm:px-8 lg:scroll-mt-32 lg:px-12 lg:py-10">
          <div>
            <div class="section-heading reveal">
              <UBadge color="neutral" variant="soft" class="section-badge">Leaderboard</UBadge>
              <h2 class="display-font section-title">
                Reported accuracy on MMOU
              </h2>
              <p class="section-copy">
                Humans score 84.3%, well above every model we tested. Below is a breakdown of all evaluated
                systems, from frontier closed-source models to open-source, unimodal, and text-only baselines.
              </p>
            </div>

            <UCard class="leaderboard-card mt-8 rounded-[32px] p-2">
              <div class="space-y-4 px-4 py-4 sm:px-5">
                <h3 class="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                  A 26.8-point gap separates the best model from human performance.
                </h3>

                <div class="grid gap-3 xl:grid-cols-2">
                  <div v-for="item in results" :key="item.name"
                    class="rounded-[24px] border border-[var(--border)] bg-[var(--chip-bg)] px-4 py-4">
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-base font-semibold text-[var(--ink)]">{{ item.name }}</p>
                        <p class="text-sm text-[var(--muted)]">{{ item.group }}</p>
                      </div>
                      <p class="text-xl font-bold tracking-[-0.03em] text-[var(--ink)]">{{ item.score }}%</p>
                    </div>
                    <div class="mt-3 score-track">
                      <div :class="['score-fill', `score-fill--${item.tone}`]" :style="scoreStyle(item.score)" />
                    </div>
                    <p class="mt-3 text-sm/7 text-[var(--muted)]">{{ item.note }}</p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </section>
      </main>

      <footer class="mx-auto max-w-7xl px-6 pb-8 sm:px-8 lg:px-12">
        <div
          class="footer-panel flex flex-col gap-4 rounded-[28px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">MMOU</p>
            <p class="mt-2 text-sm text-[var(--muted)]">
              A benchmark for audio-visual reasoning over long, real-world web videos.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <UButton color="neutral" variant="outline"
              class="button-fx min-w-[8.75rem] justify-center whitespace-nowrap rounded-full border-[var(--border-strong)] bg-white/68 px-5 text-sm font-semibold text-[var(--ink)]"
              @click="jumpTo('#abstract')">
              Back to top
            </UButton>
            <UButton color="neutral" variant="outline"
              class="button-fx min-w-[8.75rem] justify-center whitespace-nowrap rounded-full border-[var(--border-strong)] bg-white/68 px-5 text-sm font-semibold text-[var(--ink)]"
              @click="jumpTo('#failure-cases')">
              Failure Cases
            </UButton>
            <UButton color="neutral"
              class="button-fx min-w-[8.75rem] justify-center whitespace-nowrap rounded-full px-5 text-sm"
              @click="jumpTo('#examples')">
              See Examples
            </UButton>
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>
