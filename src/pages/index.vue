<!-- eslint-disable no-alert -->
<script setup lang="ts" generic="T extends any, O extends any">
import type { BlockState } from '~/composables/blockState'

const WIDTH = 10
const HEIGHT = 10

let mineGenerated: boolean = false
const dev = false

let currentBlock: BlockState

const state = ref(Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x): BlockState => ({
    x,
    y,
    revealed: false,
    mine: false,
    flagged: false,
    adjacentMines: 0,
  }))))

const totalMines = computed(() => {
  let sum = 0

  for (const row of state.value) {
    for (const item of row) {
      if (item.mine)
        sum++
    }
  }

  return sum
})

const flaggedCount = computed(() => {
  const blocks = state.value.flat()
  return blocks.filter(e => e.flagged).length
})

function generateMines(firstBlock: BlockState) {
  state.value.forEach((row: Array<BlockState>) => {
    row.forEach((block: BlockState) => {
      if (Math.abs(firstBlock.y - block.y) <= 1 || Math.abs(firstBlock.x - block.x) <= 1)
        block.mine = false
      else
        block.mine = Math.random() < 0.3
    })
  })
}

const directions = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
]

function updateNumbers() {
  state.value.forEach((row: Array<BlockState>) => {
    row.forEach((block: BlockState) => {
      if (block.mine)
        return

      AroundCirclesBlocks(block).forEach((element: BlockState) => {
        block.adjacentMines += element.mine ? 1 : 0
      })
    })
  })
}

function AroundCirclesBlocks(block: BlockState) {
  return directions.map((direction) => {
    const dy = block.y + direction[1]
    const dx = block.x + direction[0]

    if (dy < 0 || dx < 0)
      return null
    if (dy >= HEIGHT || dx >= WIDTH)
      return null
    return state.value[dy][dx]
  }).filter(item => item != null) as BlockState[]
}

function expendZero(block: BlockState) {
  if (block.adjacentMines)
    return

  AroundCirclesBlocks(block).forEach((s) => {
    if (!s.revealed) {
      s.revealed = true
      expendZero(s)
    }
  })
}

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-black-500',
]

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'

  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/50'

  if (block.mine)
    return 'bg-red-500'
  else
    return numberColors[block.adjacentMines]
}

function onClick(block: BlockState) {
  currentBlock = block

  if (!mineGenerated) {
    mineGenerated = true
    generateMines(block)
    updateNumbers()
  }

  if (block.revealed || block.flagged)
    return

  expendZero(block)
  block.revealed = true

  if (block.mine)
    alert('BOOM!')
}

function onRightClick(block: BlockState) {
  if (block.revealed)
    return

  currentBlock = block
  block.flagged = !block.flagged
}

function checkGameState() {
  // console.log(`mineGenerated is ${mineGenerated}`)
  // console.log('checkGameState')

  const blocks = state.value.flat()

  if (blocks.every(a => a.revealed || a.flagged)) {
    if (blocks.some(b => !b.mine && b.flagged))
      alert('You cheat!')
    else
      alert('You win!!!')
  }
}

function onResetClick() {
  mineGenerated = false
  state.value.forEach((y: Array<BlockState>) => {
    y.forEach((e: BlockState) => {
      e.revealed = false
      e.mine = false
      e.flagged = false
      e.adjacentMines = 0
    })
  })
}

watchEffect(checkGameState)

// generateMines()
// updateNumbers()
</script>

<template>
  <div>MineSweeper</div>
  <div p5>
    <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
      <button
        v-for="block, x in row"
        :key="x"
        :class="getBlockClass(block)"
        flex="~" h-7 w-7 m="0.5" items-center justify-center
        border="1 gray-400/50"
        @click="onClick(block)"
        @contextmenu.prevent="onRightClick(block)"
      >
        <template v-if="block.flagged">
          <div text-red>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 20.5V5h7.192l.4 2H19v8h-5.192l-.4-2H7v7.5H6Z" /></svg>
          </div>
        </template>
        <template v-else-if="block.revealed || dev">
          <div v-if="block.mine">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M23 13v-2h-3.07a7.988 7.988 0 0 0-1.62-3.9l2.19-2.17l-1.43-1.43l-2.17 2.19A7.988 7.988 0 0 0 13 4.07V1h-2v3.07c-1.42.18-2.77.74-3.9 1.62L4.93 3.5L3.5 4.93L5.69 7.1A7.988 7.988 0 0 0 4.07 11H1v2h3.07c.18 1.42.74 2.77 1.62 3.9L3.5 19.07l1.43 1.43l2.17-2.19c1.13.88 2.48 1.44 3.9 1.62V23h2v-3.07c1.42-.18 2.77-.74 3.9-1.62l2.17 2.19l1.43-1.43l-2.19-2.17a7.988 7.988 0 0 0 1.62-3.9H23M12 8a4 4 0 0 0-4 4H6a6 6 0 0 1 6-6v2Z" /></svg>
          </div>
          <div v-else>
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>
  <button h-10 w-20 border-rd bg-green-500 @click="onResetClick()">
    Reset
  </button>
  <div flex="~" flex-col items-center justify-center p5>
    <template v-if="currentBlock">
      <h1>You clicked row: {{ currentBlock.y + 1 }}, column:{{ currentBlock.x + 1 }}</h1>
      <h5>Total Mine Count:{{ totalMines }}, Current Flagged: {{ flaggedCount }}</h5>
    </template>
    <p v-else>
      Please click one block to start game. Enjoy~
    </p>
  </div>
</template>
~/composables/types
~/composables/blockState
