<!-- eslint-disable no-alert -->
<script setup lang="ts" generic="T extends any, O extends any">
import type { BlockState } from '~/composables/blockState'
import { GameManager } from '~/GameManager'

const dictChnDifficulty = {
  Easy: '简单',
  Normal: '普通',
  Hard: '困难',
}

const selectedDifficulty: ref<'Easy' | 'Normal' | 'Hard'> = ref('Hard')

const dev = false
const GM = reactive(new GameManager(selectedDifficulty.value))

// const totalMines = computed(() => {
//   let sum = 0

//   for (const row of GM.blocks) {
//     for (const item of row) {
//       if (item.mine)
//         sum++
//     }
//   }

//   return sum
// })

const flaggedCount = computed(() => {
  const blocks = GM.blocks.flat() as BlockState[]
  return blocks.filter(e => e.flagged).length
})

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
    return 'bg-gray-600/10'

  if (!block.revealed)
    return 'bg-gray-600/40 hover:bg-gray/50'

  if (block.mine)
    return 'bg-red-500'
  else
    return numberColors[block.adjacentMines]
}

function onClick(block: BlockState) {
  GM.revealBlock(block)
}

function onRightClick(block: BlockState) {
  GM.flag(block)
}

function onDBLClick(block: BlockState) {
  GM.expend(block)
}

function onResetClick() {
  GM.gameReset()
}

watchEffect(() => {
  switch (GM.gameState) {
    case GameState.CHEAT:
    case GameState.LOSE:
      GM.showAll()
      break
    case GameState.WIN:
      GM.showAll()
      break
    default:
      break
  }
})

watchEffect(() => {
  GM.updateConfig(selectedDifficulty.value)
})
</script>

<template>
  <h2 m="1.5" font-size-6>
    来一局扫雷！
  </h2>
  <div flex="~" m="1" items-center justify-center>
    <select id="selDifffcult" v-model="selectedDifficulty" name="sel" h-8 w-40 border-rd border="1 gray-500/20">
      <option v-for="x in Object.keys(dictChnDifficulty)" :key="x" :value="x">
        {{ `地雷: ${GM.CONFIG_DIFFICULTY_LEVELS[x].mineCount}` }}
      </option>
    </select>
    <button flex="~" ml h-8 w-16 items-center justify-center border-rd bg-green-500 @click="onResetClick()">
      <template v-if="GM.gameState === GameState.WIN">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88ZM80 108a12 12 0 1 1 12 12a12 12 0 0 1-12-12Zm96 0a12 12 0 1 1-12-12a12 12 0 0 1 12 12Zm-1.07 48c-10.29 17.79-27.4 28-46.93 28s-36.63-10.2-46.92-28a8 8 0 1 1 13.84-8c7.47 12.91 19.21 20 33.08 20s25.61-7.1 33.07-20a8 8 0 0 1 13.86 8Z" /></svg>
      </template>
      <template v-else-if="GM.gameState === GameState.LOSE || GM.gameState === GameState.CHEAT">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88ZM80 108a12 12 0 1 1 12 12a12 12 0 0 1-12-12Zm96 0a12 12 0 1 1-12-12a12 12 0 0 1 12 12Zm-1.08 64a8 8 0 1 1-13.84 8c-7.47-12.91-19.21-20-33.08-20s-25.61 7.1-33.08 20a8 8 0 1 1-13.84-8c10.29-17.79 27.39-28 46.92-28s36.63 10.2 46.92 28Z" /></svg>
      </template>
      <template v-else>
        <!-- <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M176 112h-24a8 8 0 0 1 0-16h24a8 8 0 0 1 0 16Zm-72-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16Zm137.48 104.65a36 36 0 0 1-54.94 4.81c-.12-.12-.24-.24-.35-.37L146.48 160h-37l-39.67 45.09l-.35.37A36.08 36.08 0 0 1 44 216a36 36 0 0 1-35.44-42.25a.68.68 0 0 1 0-.14l16.37-84.09A59.88 59.88 0 0 1 83.89 40H172a60.08 60.08 0 0 1 59 49.25v.18l16.37 84.17a.68.68 0 0 1 0 .14a35.74 35.74 0 0 1-5.89 26.91ZM172 144a44 44 0 0 0 0-88H83.89a43.9 43.9 0 0 0-43.21 36.37v.13L24.3 176.59A20 20 0 0 0 58 194.3l41.92-47.59a8 8 0 0 1 6-2.71Zm59.7 32.59l-8.74-45A60 60 0 0 1 172 160h-4.2l30.2 34.31a20.09 20.09 0 0 0 17.46 5.39a20 20 0 0 0 16.23-23.11Z" /></svg> -->
        重置
      </template>
    </button>
  </div>
  <div p5>
    <div v-for="row, y in GM.blocks" :key="y" flex="~" items-center justify-center>
      <button
        v-for="block, x in row"
        :key="x"
        :class="getBlockClass(block)"
        flex="~" h-7 w-7 m="0.5" items-center justify-center
        border="1 gray-500/20"
        @click="onClick(block)"
        @contextmenu.prevent="onRightClick(block)"
        @dblclick="onDBLClick(block)"
      >
        <template v-if="block.flagged">
          <div v-if="!block.mine && GM.gameState === GameState.LOSE && block.revealed" text-red>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M20 20L4 4m16 0L4 20" /></svg>
          </div>
          <div v-else text-red>
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
  <div flex="~" flex-col items-center justify-left>
    <div flex="~" flex-col items-center justify-left p5>
      <h1>GameState: {{ GM.gameState }}</h1>
      <h2>{{ flaggedCount }}</h2>
      <h1>游戏提示：</h1>
      <h2>鼠标左键：翻开格子</h2>
      <h2>鼠标右键：标记地雷</h2>
      <h2>鼠标双击：翻开周边一圈的格子，要确保标记好周围的地雷，否则会引爆哦</h2>
    </div>
  </div>
</template>
