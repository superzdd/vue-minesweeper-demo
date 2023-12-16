import type { BlockState, DifficultyLevelConfig, GameBoard } from './composables/blockState'
import { GameState } from './composables/gameStat'

export class GameManager {
  public mineGenerated: boolean = false
  public gameState = GameState.DNP
  // width: number = 0
  // height: number = 0
  public blocks: BlockState[][]
  public currentBlock: BlockState | undefined
  directions: number[][] = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ]

  private CONFIG_DIFFICULTY_LEVELS: DifficultyLevelConfig = {
    Easy: {
      width: 5,
      height: 5,
      mineCount: 5,
    },
    Normal: {
      width: 10,
      height: 10,
      mineCount: 20,
    },
    Hard: {
      width: 15,
      height: 15,
      mineCount: 30,
    },
  }

  public current_diff_config!: GameBoard

  public constructor(difficulty: 'Easy' | 'Normal' | 'Hard') {
    // this.width = this.CONFIG_DIFFICULTY_LEVELS[difficulty].width
    // this.height = this.CONFIG_DIFFICULTY_LEVELS[difficulty].height
    this.current_diff_config = this.CONFIG_DIFFICULTY_LEVELS[difficulty]
    this.blocks = this.initArrays()
  }

  private initArrays() {
    return Array.from({ length: this.current_diff_config.height }, (_, y) =>
      Array.from({ length: this.current_diff_config.width }, (_, x): BlockState => ({
        x,
        y,
        revealed: false,
        mine: false,
        flagged: false,
        adjacentMines: 0,
      })))
  }

  public initMines(firstBlock: BlockState) {
    this.mineGenerated = true
    this.generateMines(firstBlock)
    this.updateNumbers()
  }

  private generateMines(firstBlock: BlockState) {
    let { width, height, mineCount } = this.current_diff_config
    const blockCount = width * height
    const totalBlocks = Array.from({ length: blockCount }, (_, x) => x)
    const finalBlocks = []

    totalBlocks.splice(firstBlock.y * width + firstBlock.x, 1)

    while (mineCount > 0) {
      const idx = Math.floor(Math.random() * totalBlocks.length)
      finalBlocks.push(totalBlocks[idx])
      totalBlocks.splice(idx, 1)
      mineCount--
    }
    // console.log(`generateMines: ${finalBlocks}`)

    finalBlocks.forEach((e) => {
      const row = Math.floor(e / width)
      const col = e % width
      // console.log(`e: ${e + 1}, row: ${row + 1}, col: ${col + 1}`)
      this.blocks[row][col].mine = true
    })
  }

  private updateNumbers() {
    this.blocks.forEach((row: Array<BlockState>) => {
      row.forEach((block: BlockState) => {
        if (block.mine)
          return

        this.AroundCirclesBlocks(block).forEach((element: BlockState) => {
          block.adjacentMines += element.mine ? 1 : 0
        })
      })
    })
  }

  private AroundCirclesBlocks(block: BlockState) {
    return this.directions.map((direction) => {
      const dy = block.y + direction[1]
      const dx = block.x + direction[0]

      if (dy < 0 || dx < 0)
        return null
      if (dy >= this.current_diff_config.height || dx >= this.current_diff_config.width)
        return null
      return this.blocks[dy][dx]
    }).filter(item => item != null) as BlockState[]
  }

  public revealBlock(block: BlockState) {
    this.currentBlock = block

    if (!this.mineGenerated)
      this.initMines(block)

    if (block.revealed || block.flagged)
      return

    if (block.mine) {
      this.showAll()
      this.gameState = GameState.LOSE
      return
    }

    this.expendZero(block)
    block.revealed = true

    this.checkGameState()
  }

  public flag(block: BlockState) {
    this.currentBlock = block

    if (!this.mineGenerated)
      this.initMines(block)

    if (block.revealed)
      return

    block.flagged = !block.flagged

    this.checkGameState()
  }

  /**
   * 展示所有的方块
   */
  public showAll() {
    this.blocks.flat().forEach((e) => {
      e.revealed = true
    })
  }

  public gameReset() {
    this.mineGenerated = false
    this.gameState = GameState.DNP
    this.blocks.forEach((y: Array<BlockState>) => {
      y.forEach((e: BlockState) => {
        e.revealed = false
        e.mine = false
        e.flagged = false
        e.adjacentMines = 0
      })
    })
  }

  public updateConfig(difficulty: 'Easy' | 'Normal' | 'Hard') {
    // this.width = this.CONFIG_DIFFICULTY_LEVELS[difficulty].width
    // this.height = this.CONFIG_DIFFICULTY_LEVELS[difficulty].height
    this.current_diff_config = this.CONFIG_DIFFICULTY_LEVELS[difficulty]
    this.blocks = this.initArrays()
    this.gameReset()
    // console.log(`config change complete, all blocks inited:`)
    // console.log(`blocks width: ${this.blocks[0].length}, height: ${this.blocks.length}`)
  }

  private expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.AroundCirclesBlocks(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expendZero(s)
      }
    })
  }

  private checkGameState() {
    if (!this.mineGenerated || !this.blocks)
      this.gameState = GameState.DNP
    else
      this.gameState = GameState.PLAYING

    const blocks = this.blocks.flat()

    if (blocks.every(a => a.revealed || a.flagged)) {
      if (blocks.some(b => !b.mine && b.flagged))
        this.gameState = GameState.CHEAT
      else
        this.gameState = GameState.WIN
    }
  }
}
