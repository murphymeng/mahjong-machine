import { reactive } from 'vue';
import { createMachine, assign, AnyEventObject } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
  getOperationList,
  canPeng,
  ctx,
  discardTile,
  drawTile,
  getDiscardTile,
  initGame,
  setOperationList
} from '../mahjong';

// const mjModel = createModel({});

const turnToNextPlayer = () => {
  if (ctx.currentPlayer >= 3) {
    ctx.currentPlayer = 0;
  } else {
    ctx.currentPlayer++;
  }
};

const drawTileForCurrentPlayer = () => {
  turnToNextPlayer();
  console.log(`给玩家${ctx.currentPlayer}发牌`);
  ctx.hands[ctx.currentPlayer] = drawTile(ctx.hands[ctx.currentPlayer]);
};

const currentPlayerDistardTile = (context, event) => {
  discardTile(event.tile);
  setOperationList();
};

function someOneCanOperate() {
  if (ctx.operationList) {
    return ctx.operationList.length > 0;
  }
}

export default createMachine(
  {
    id: 'fetch',
    initial: 'gameReady',
    states: {
      gameReady: {
        entry: initGame,
        on: {
          '': 'drawTile'
        }
      },
      drawTile: {
        on: {
          '': { target: 'waitToDiscard', actions: [drawTileForCurrentPlayer] }
        }
      },
      afterDiscard: {
        after: {
          0: [
            { cond: someOneCanOperate, target: 'waitOtherPlayerOperation' },
            { target: 'drawTile' }
          ]
        }
      },
      waitToDiscard: {
        on: {
          discard: {
            actions: [currentPlayerDistardTile],
            target: 'afterDiscard'
          },
          gang: {
            target: 'waitToDiscard',
            actions: ['getTile']
          },
          zimo: {
            target: 'end'
          }
        }
      },
      waitOtherPlayerOperation: {
        entry: [],
        on: {
          mingpai: {
            target: 'waitToDiscard'
          },
          peng: {
            target: 'waitToDiscard'
          }
        }
      },
      end: {
        type: 'final'
      }
    }
  },
  {
    actions: {}
  }
);
