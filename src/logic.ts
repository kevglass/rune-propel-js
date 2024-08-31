import type { DuskClient } from "dusk-games-sdk/multiplayer"
import { physics } from "propel-js"
import {
  carInteractiveInit,
  carInteractiveUpdate,
  WorldIds,
} from "./examples/CarInteractive"

export interface GameState {
  world: physics.World
  ids: WorldIds
  inputs: { left: boolean; right: boolean }
}

type GameActions = {
  controls: (inputs: { left: boolean; right: boolean }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

Dusk.initLogic({
  minPlayers: 1,
  maxPlayers: 2,
  updatesPerSecond: 30,
  update: ({ game }) => {
    // test
    physics.worldStep(60, game.world)
    physics.worldStep(60, game.world)
    carInteractiveUpdate(
      game.inputs.left,
      game.inputs.right,
      game.world,
      game.ids
    )
  },
  reactive: false,
  setup: () => {
    const data = carInteractiveInit()
    return {
      world: data.world,
      ids: data.ids,
      inputs: { left: false, right: false },
    }
  },
  actions: {
    controls: (inputs, { game }) => {
      game.inputs = { ...inputs }
    },
  },
})
