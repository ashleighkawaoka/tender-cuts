<script setup lang="ts">
import type { Cut, DonenessBand } from '~/utils/content'

const props = defineProps<{ cut: Cut }>()

const SIZE = 320
const CENTER = SIZE / 2
// Room on the left/right for the stop labels beside the dial
const VIEW_BOX = '-50 0 420 320'
const R_OUT = 118
const R_IN = 80
const START_ANGLE = 135 // bottom-left, sweeping 270° clockwise
const SWEEP = 270

// Fixed-precision coordinates so server and client render identical paths.
const round = (n: number) => Math.round(n * 100) / 100

const bands = computed(() => [...props.cut.doneness].sort((a, b) => a.order - b.order))
// Bacon's stops are by look, not temperature: no numbers, no safe line, equal bands.
const byLook = computed(() => isByLook(props.cut))

const scaleStart = computed(() => bands.value[0]?.startF ?? 0)
const scaleEnd = computed(() => bands.value[bands.value.length - 1]?.endF ?? 0)

// Current pointer position: °F for temperature dials, band index for by-look.
const temperature = ref(scaleStart.value)
const bandIndex = ref(0)

const currentBand = computed<DonenessBand>(() => {
  if (byLook.value) return bands.value[bandIndex.value] ?? bands.value[0]
  const t = temperature.value
  return (
    bands.value.find((b, i) => {
      const last = i === bands.value.length - 1
      return t >= (b.startF ?? 0) && (last ? t <= (b.endF ?? 0) : t < (b.endF ?? 0))
    }) ?? bands.value[bands.value.length - 1]
  )
})

const toCelsius = (f: number) => Math.round(((f - 32) * 5) / 9)

const polar = (angleDeg: number, radius: number) => ({
  x: round(CENTER + radius * Math.cos((angleDeg * Math.PI) / 180)),
  y: round(CENTER + radius * Math.sin((angleDeg * Math.PI) / 180)),
})

const fractionToAngle = (frac: number) => START_ANGLE + frac * SWEEP

function bandFractions(band: DonenessBand, index: number): [number, number] {
  if (byLook.value) {
    const n = bands.value.length
    return [index / n, (index + 1) / n]
  }
  const span = scaleEnd.value - scaleStart.value
  return [
    ((band.startF ?? 0) - scaleStart.value) / span,
    ((band.endF ?? 0) - scaleStart.value) / span,
  ]
}

function bandPath(band: DonenessBand, index: number): string {
  const [f1, f2] = bandFractions(band, index)
  const a1 = fractionToAngle(f1)
  const a2 = fractionToAngle(f2)
  const largeArc = a2 - a1 > 180 ? 1 : 0
  const o1 = polar(a1, R_OUT)
  const o2 = polar(a2, R_OUT)
  const i1 = polar(a2, R_IN)
  const i2 = polar(a1, R_IN)
  return `M ${o1.x} ${o1.y} A ${R_OUT} ${R_OUT} 0 ${largeArc} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${R_IN} ${R_IN} 0 ${largeArc} 0 ${i2.x} ${i2.y} Z`
}

function labelPosition(band: DonenessBand, index: number) {
  const [f1, f2] = bandFractions(band, index)
  const angle = fractionToAngle((f1 + f2) / 2)
  const point = polar(angle, R_OUT + 22)
  const cos = Math.cos((angle * Math.PI) / 180)
  const anchor = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle'
  return { ...point, anchor }
}

// Temperature labels at band boundaries, inside the ring.
const boundaryLabels = computed(() => {
  if (byLook.value) return []
  return bands.value
    .flatMap((band, i) => {
      const labels = [
        {
          angle: fractionToAngle(bandFractions(band, i)[0]),
          f: band.startF!,
          c: band.startC ?? toCelsius(band.startF!),
          key: `${band.order}-start`,
        },
      ]
      if (i === bands.value.length - 1) {
        labels.push({
          angle: fractionToAngle(bandFractions(band, i)[1]),
          f: band.endF!,
          c: band.endC ?? toCelsius(band.endF!),
          key: `${band.order}-end`,
        })
      }
      return labels
    })
    .map((l) => ({ ...l, ...polar(l.angle, R_IN - 12) }))
})

const safeAngle = computed(() => {
  const span = scaleEnd.value - scaleStart.value
  if (!span) return 0
  return fractionToAngle((props.cut.usdaSafeF - scaleStart.value) / span)
})
const safeLine = computed(() => ({
  from: polar(safeAngle.value, R_IN - 6),
  to: polar(safeAngle.value, R_OUT + 6),
}))

const pointerAngle = computed(() => {
  if (byLook.value) {
    const n = bands.value.length
    return fractionToAngle((bandIndex.value + 0.5) / n)
  }
  const span = scaleEnd.value - scaleStart.value
  return fractionToAngle((temperature.value - scaleStart.value) / span)
})
const pointerPosition = computed(() => polar(pointerAngle.value, (R_OUT + R_IN) / 2))

// Enough contrast for the center readout on the current band's color.
const centerTextColor = computed(() => {
  const hex = currentBand.value.color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.45 ? 'var(--ink)' : 'var(--paper)'
})

const ariaValueText = computed(() => {
  if (byLook.value) return currentBand.value.stop
  return `${Math.round(temperature.value)}°F (${toCelsius(temperature.value)}°C), ${currentBand.value.stop}`
})

// --- Interaction -----------------------------------------------------------

const svgEl = ref<SVGSVGElement | null>(null)
const dragging = ref(false)

function angleToValue(angleDeg: number) {
  // Normalize into the sweep; snap to the nearest end when in the gap.
  let frac = (((angleDeg - START_ANGLE) % 360) + 360) % 360 / SWEEP
  if (frac > 1) frac = frac < 1 + 360 / SWEEP / 6 ? 1 : 0
  frac = Math.min(1, Math.max(0, frac))
  if (byLook.value) {
    bandIndex.value = Math.min(bands.value.length - 1, Math.floor(frac * bands.value.length))
  } else {
    temperature.value = scaleStart.value + frac * (scaleEnd.value - scaleStart.value)
  }
}

function updateFromPointer(event: PointerEvent) {
  const ctm = svgEl.value?.getScreenCTM()
  if (!ctm) return
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
  angleToValue((Math.atan2(point.y - CENTER, point.x - CENTER) * 180) / Math.PI)
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  ;(event.target as Element).setPointerCapture?.(event.pointerId)
  updateFromPointer(event)
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) updateFromPointer(event)
}

function onPointerUp() {
  dragging.value = false
}

function onKeydown(event: KeyboardEvent) {
  const step =
    event.key === 'ArrowRight' || event.key === 'ArrowUp'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
        ? -1
        : 0
  if (!step) return
  event.preventDefault()
  if (byLook.value) {
    bandIndex.value = Math.min(bands.value.length - 1, Math.max(0, bandIndex.value + step))
  } else {
    temperature.value = Math.min(
      scaleEnd.value,
      Math.max(scaleStart.value, Math.round(temperature.value) + step),
    )
  }
}
</script>

<template>
  <div class="dial">
    <svg
      ref="svgEl"
      class="dial__svg"
      :viewBox="VIEW_BOX"
      role="slider"
      tabindex="0"
      :aria-label="`${cut.name} doneness`"
      :aria-valuemin="byLook ? 1 : scaleStart"
      :aria-valuemax="byLook ? bands.length : scaleEnd"
      :aria-valuenow="byLook ? bandIndex + 1 : Math.round(temperature)"
      :aria-valuetext="ariaValueText"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <path
        v-for="(band, i) in bands"
        :key="band.order"
        class="dial__band"
        :d="bandPath(band, i)"
        :fill="band.color"
      />

      <text
        v-for="(band, i) in bands"
        :key="`label-${band.order}`"
        class="dial__stop-label"
        :x="labelPosition(band, i).x"
        :y="labelPosition(band, i).y"
        :text-anchor="labelPosition(band, i).anchor"
        dominant-baseline="middle"
      >
        {{ band.stop }}
      </text>

      <g v-for="label in boundaryLabels" :key="label.key" class="dial__boundary">
        <text class="dial__temp dial__temp--f" :x="label.x" :y="label.y - 3" text-anchor="middle">
          {{ label.f }}°F
        </text>
        <text class="dial__temp dial__temp--c" :x="label.x" :y="label.y + 8" text-anchor="middle">
          {{ label.c }}°C
        </text>
      </g>

      <line
        v-if="!byLook"
        class="dial__safe-line"
        :x1="safeLine.from.x"
        :y1="safeLine.from.y"
        :x2="safeLine.to.x"
        :y2="safeLine.to.y"
      />

      <circle class="dial__center" :cx="CENTER" :cy="CENTER" r="50" :fill="currentBand.color" />
      <g class="dial__readout" :style="{ color: centerTextColor, fill: centerTextColor }">
        <template v-if="!byLook">
          <text class="dial__degrees-f" :x="CENTER" :y="CENTER - 14" text-anchor="middle">
            {{ Math.round(temperature) }}°F
          </text>
          <text class="dial__degrees-c" :x="CENTER" :y="CENTER + 4" text-anchor="middle">
            {{ toCelsius(temperature) }}°C
          </text>
          <text class="dial__stop-name" :x="CENTER" :y="CENTER + 24" text-anchor="middle">
            {{ currentBand.stop }}
          </text>
        </template>
        <text v-else class="dial__stop-name dial__stop-name--look" :x="CENTER" :y="CENTER" text-anchor="middle" dominant-baseline="middle">
          {{ currentBand.stop }}
        </text>
      </g>

      <circle
        class="dial__pointer"
        :cx="pointerPosition.x"
        :cy="pointerPosition.y"
        r="11"
      />
    </svg>
    <p v-if="!byLook" class="dial__safe-legend">
      <span class="dial__safe-sample" aria-hidden="true"></span>
      USDA safe minimum — {{ cut.usdaSafeF }}°F ({{ toCelsius(cut.usdaSafeF) }}°C)
    </p>
  </div>
</template>
