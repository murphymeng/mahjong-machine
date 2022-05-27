//################################
// PARAMETERS
// Contains Parameters to change the playstile of the bot. Usually no need to change anything.
//################################

import { reactive } from 'vue';
import { getTileName } from './utils';

type TileType = 0 | 1 | 2 | 3;
type TileIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Player = -1 | 0 | 1 | 2 | 3; // -1代表游戏没开始

export type Tile = {
  dora: boolean;
  doraValue: number;
  index: TileIndex;
  type: TileType;
};

type GameOptions = {
  discardTile?: Tile;
  currentPlayer: Player;
  visibleTiles: Tile[];
  availableTiles: Tile[];
  dora: Tile[];
  allDoraTiles: Tile[];
  gangDrawTiles: Tile[];
  ownHand: Tile[];
  hands: [Tile[], Tile[], Tile[], Tile[]];
  discards: [Tile[], Tile[], Tile[], Tile[]];
  calls: [Tile[], Tile[], Tile[], Tile[]];
  tilesLeft: number;
  operationList?: Operation[];
};

export type Operation = {
  type: string;
  typeDesc: string;
  player: Player;
  discardTile: Tile;
  combo: Tile[];
};

/* PERFORMANCE MODE
 * Range 0 to 4. Decrease calculation time at the cost of efficiency (2 equals the time of ai version 1.2.1 and before).
 * 4 = Highest Precision and Calculation Time. 0 = Lowest Precision and Calculation Time.
 * Note: The bot will automatically decrease the performance mode when it approaches the time limit.
 * Note 2: Firefox is usually able to run the script faster than Chrome.
 */

seatWind = 2;
roundWind = 1;

export const ctx = reactive<GameOptions>({
  currentPlayer: -1,
  visibleTiles: [],
  availableTiles: [], //Tiles that are available
  dora: [],
  allDoraTiles: [],
  gangDrawTiles: [],
  ownHand: [], //index, type, dora
  hands: [[], [], [], []],
  discards: [[], [], [], []], //Later: Change to array for each player
  calls: [[], [], [], []], //
  tilesLeft: 70
});

export function getDiscardTile() {
  const discard = ctx.discards[ctx.currentPlayer];
  return discard[discard.length - 1];
}

export function initGame() {
  for (let i = 0; i < 10; i++) {
    ctx.allDoraTiles = drawTile(ctx.allDoraTiles);
  }
  for (let i = 0; i < 3; i++) {
    ctx.gangDrawTiles = drawTile(ctx.gangDrawTiles);
  }
  ctx.dora = [ctx.allDoraTiles[0]];
  ctx.hands.forEach((hand, idx) => {
    for (let i = 0; i < 13; i++) {
      ctx.hands[idx] = drawTile(ctx.hands[idx]);
    }
  });

  ctx.ownHand = ctx.hands[0];
}

const PERFORMANCE_MODE = 3;

//HAND EVALUATION CONSTANTS
const EFFICIENCY = 1.0; // Lower: Slower and more expensive hands. Higher: Faster and cheaper hands. Default: 1.0, Minimum: 0
const SAFETY = 1.0; // Lower: The bot will not pay much attention to safety. Higher: The bot will try to play safer. Default: 1.0, Minimum: 0
const SAKIGIRI = 1.0; //Lower: Don't place much importance on Sakigiri. Higher: Try to Sakigiri more often. Default: 1.0, Minimum: 0

//CALL CONSTANTS
const CALL_PON_CHI = 1.0; //Lower: Call Pon/Chi less often. Higher: Call Pon/Chi more often. Default: 1.0, Minimum: 0
const CALL_KAN = 1.0; //Lower: Call Kan less often. Higher: Call Kan more often. Default: 1.0, Minimum: 0

//STRATEGY CONSTANTS
const RIICHI = 1.0; //Lower: Call Riichi less often. Higher: Call Riichi more often. Default: 1.0, Minimum: 0
const CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu. Default: 5
const THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans. Default: 10
const KEEP_SAFETILE = false; //If set to true the bot will keep 1 safetile

//MISC
const LOG_AMOUNT = 3; //Amount of Messages to log for Tile Priorities
const DEBUG_BUTTON = false; //Display a Debug Button in the GUI
const USE_EMOJI = true; //use EMOJI to show tile
const CHANGE_RECOMMEND_TILE_COLOR = true; // change current recommend tile color

//### GLOBAL VARIABLES DO NOT CHANGE ###
const run = false; //Is the bot running
const threadIsRunning = false;
const AIMODE = {
  //ENUM of AI mode
  AUTO: 0,
  HELP: 1
};
const AIMODE_NAME = [
  //Name of AI mode
  'Auto',
  'Help'
];
const STRATEGIES = {
  //ENUM of strategies
  GENERAL: 'General',
  CHIITOITSU: 'Chiitoitsu',
  FOLD: 'Fold',
  THIRTEEN_ORPHANS: 'Thirteen_Orphans'
};
const strategy = STRATEGIES.GENERAL; //Current strategy
const strategyAllowsCalls = true; //Does the current strategy allow calls?
const isClosed = true; //Is own hand closed?
const dora = []; //Array of Tiles (index, type, dora)
const ownHand = []; //index, type, dora
const discards = []; //Later: Change to array for each player
const calls = []; //Calls/Melds of each player
var seatWind = 1; //1: East,... 4: North
var roundWind = 1; //1: East,... 4: North
const tilesLeft = 0; //tileCounter
const visibleTiles = []; //Tiles that are visible
const errorCounter = 0; //Counter to check if bot is working
const lastTilesLeft = 0; //Counter to check if bot is working
const isConsideringCall = false;
const riichiTiles = [null, null, null, null]; // Track players discarded tiles on riichi
const functionsExtended = false;
const playerDiscardSafetyList = [[], [], [], []];
const totalPossibleWaits = {};
const timeSave = 0;
const showingStrategy = false; //Current in own turn?

// Display
const tileEmojiList = [
  ['red🀝', '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'],
  ['red🀋', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'],
  ['red🀔', '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'],
  ['', '🀀', '🀁', '🀂', '🀃', '🀆', '🀅', '🀄']
];

//LOCAL STORAGE
const AUTORUN = window.localStorage.getItem('alphajongAutorun') == 'true';
let ROOM = window.localStorage.getItem('alphajongRoom');

ROOM = ROOM == null ? 2 : ROOM;

let MODE = window.localStorage.getItem('alphajongAIMode');
MODE = MODE == null ? AIMODE.AUTO : parseInt(MODE);
function log(value) {
  console.log(value);
}

// export function canChi(tile: Tile, hand: Tile[]) {
//   for (let tile in hand) {
//     if (tile.index === )
//   }
// }

function getNextPlayer(current: Player) {
  if (current === 3) {
    return 0;
  } else {
    return current + 1;
  }
}

export function setOperationList() {
  const discardTile = getDiscardTile();
  const operationList = [];
  const nextPlayer = getNextPlayer(ctx.currentPlayer);
  if (canChi(discardTile, ctx.hands[nextPlayer])) {
    operationList.push({
      type: 'chi',
      typeDesc: '吃',
      player: nextPlayer
    });
  }

  for (let i = 0; i < ctx.hands.length; i++) {
    if (i === ctx.currentPlayer) {
      continue;
    }
    const hand = ctx.hands[i];

    const pengInfo = getPengInfo(discardTile, hand);

    if (pengInfo.can) {
      operationList.push({
        type: 'peng',
        typeDesc: '碰',
        player: i,
        discardTile,
        combo: pengInfo.combo
      });
    }
  }
  ctx.operationList = operationList;
}

function canChi(tile: Tile, hand: Tile[]) {
  const combo1 = {
    prevPrev: [] as Tile[],
    prev: [] as Tile[]
  }; // 为顺子中第三张
  const combo2 = {
    prev: [] as Tile[],
    next: [] as Tile[]
  }; // 为顺子中中间张
  const combo3 = {
    next: [] as Tile[],
    nextNext: [] as Tile[]
  }; // 为顺子中第一张

  for (let i = 0; i < hand.length; i++) {
    if (hand[i].type === tile.type) {
      if (hand[i].index + 2 === tile.index) {
        combo1.prevPrev.push(hand[i]);
      }
      if (hand[i].index + 1 === tile.index) {
        combo1.prev.push(hand[i]);
        combo2.prev.push(hand[i]);
      }
      if (hand[i].index - 1 === tile.index) {
        combo2.next.push(hand[i]);
        combo3.next.push(hand[i]);
      }
      if (hand[i].index - 2 === tile.index) {
        combo3.nextNext.push(hand[i]);
      }
    }
  }
  let res = false;
  if (combo1.prev.length && combo1.prevPrev.length) {
    res = true;
  }
  if (combo2.prev.length && combo2.next.length) {
    res = true;
  }
  if (combo3.next.length && combo3.nextNext.length) {
    res = true;
  }
  return res;
}

export function getPengInfo(tile: Tile, hand: Tile[]) {
  const tileList = [];
  for (const loopTile of hand) {
    if (loopTile.index === tile.index && loopTile.type === tile.type) {
      tileList.push(loopTile);
    }
  }
  const can = tileList.length >= 2;
  return {
    can,
    combo: [tileList[0], tileList[1]]
  };
}

export function canGang(tile: Tile, hand: Tile[]) {
  const tileList = [];
  for (const loopTile of hand) {
    if (loopTile.index === tile.index && loopTile.type === tile.type) {
      tileList.push(loopTile);
    }
  }
  return tileList.length === 3;
}

//Remove the given Tile from Hand
export function discardTile(tile: Tile) {
  log('Discard: ' + getTileName(tile));
  const hand = ctx.hands[ctx.currentPlayer];
  for (let i = 0; i < hand.length; i++) {
    if (
      hand[i].index == tile.index &&
      hand[i].type == tile.type &&
      hand[i].dora == tile.dora
    ) {
      ctx.discards[ctx.currentPlayer].push(hand[i]);
      console.log(i);
      ctx.hands[ctx.currentPlayer].splice(i, 1);
      break;
    }
  }
  ctx.discardTile = tile;
}

//Helper function for dora indicators
function getHigherTileIndex(tile) {
  if (tile.type == 3) {
    if (tile.index == 4) {
      return 1;
    }
    return tile.index == 7 ? 5 : tile.index + 1;
  }
  return tile.index == 9 ? 1 : tile.index + 1;
}

//Return sum of red dora/dora indicators for tile
function getTileDoraValue(tile) {
  let dr = 0;

  for (const d of ctx.dora) {
    if (d.type == tile.type && getHigherTileIndex(d) == tile.index) {
      dr++;
    }
  }

  if (tile.dora) {
    return dr + 1;
  }
  return dr;
}

//Pseudo random functionality, so every benchmark is similar
let seed = 100;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function drawTile(hand: Tile[]) {
  updateAvailableTiles();
  const randomTile =
    ctx.availableTiles[Math.floor(pseudoRandom() * ctx.availableTiles.length)];
  hand.push(randomTile);
  updateAvailableTiles();
  return hand;
}

//Return number of specific tiles available
function getNumberOfTilesAvailable(index, type) {
  if (
    index < 1 ||
    index > 9 ||
    type < 0 ||
    type > 3 ||
    (type == 3 && index > 7)
  ) {
    return 0;
  }

  return (
    4 -
    ctx.visibleTiles.filter(tile => tile.index == index && tile.type == type)
      .length
  );
}

//Update the available tile pool
function updateAvailableTiles() {
  ctx.visibleTiles = ctx.dora.concat(
    ctx.hands[0],
    ctx.hands[1],
    ctx.hands[2],
    ctx.hands[3],
    ctx.allDoraTiles,
    ctx.gangDrawTiles,
    ctx.discards[0],
    ctx.discards[1],
    ctx.discards[2],
    ctx.discards[3],
    ctx.calls[0],
    ctx.calls[1],
    ctx.calls[2],
    ctx.calls[3]
  );
  ctx.visibleTiles = ctx.visibleTiles.filter(
    tile => typeof tile != 'undefined'
  );
  ctx.availableTiles = [];
  for (let i = 0; i <= 3; i++) {
    for (let j = 1; j <= 9; j++) {
      if (i == 3 && j == 8) {
        break;
      }
      for (let k = 1; k <= getNumberOfTilesAvailable(j, i); k++) {
        const isRed =
          j == 5 &&
          i != 3 &&
          ctx.visibleTiles
            .concat(ctx.availableTiles)
            .filter(tile => tile.type == i && tile.dora).length == 0
            ? true
            : false;
        ctx.availableTiles.push({
          index: j as TileIndex,
          type: i as TileType,
          dora: isRed,
          doraValue: getTileDoraValue({ index: j, type: i, dora: isRed })
        });
      }
    }
  }
  for (const vis of ctx.visibleTiles) {
    vis.doraValue = getTileDoraValue(vis);
  }
}
