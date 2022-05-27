<template>
  <div>
    {{ ctx.hands[3].length }} <button @click="test">test</button
    ><button @click="test2">test2</button>
    <div>当前状态: {{ state.value }}</div>
    <div>余牌数: {{ ctx.availableTiles.length }}</div>
    <div>
      宝牌:
      <span v-for="(d, idx) in ctx.dora" :key="idx">{{
        getTileName(d, false)
      }}</span>
    </div>
    <div>
      当前打出的牌:
      {{ ctx.discardTile && getTileName(ctx.discardTile, false) }}
    </div>
    <div
      v-for="(hand, handIndex) in ctx.hands"
      :key="handIndex"
      style="z-index: -1"
      :class="{
        active: handIndex === ctx.currentPlayer
      }"
    >
      <label class="label"
        >玩家{{ handIndex }}: 共{{
          hand.length + ctx.calls[handIndex].length
        }}张</label
      >
      <span
        :class="{
          disabled:
            handIndex !== ctx.currentPlayer ||
            state.value === 'waitOtherPlayerOperation'
        }"
      >
        <span
          v-for="(tile, index) in sortTiles(hand)"
          :key="index"
          class="tile"
          @click="discard(tile)"
          >{{ getTileEmoji(tile.type, tile.index, tile.dora) }}</span
        >
      </span>
      <span style="margin-left: 20px">
        <span
          v-for="(tile, index) in sortTiles(ctx.calls[handIndex])"
          :key="index"
          class="called-tile"
          >{{ getTileEmoji(tile.type, tile.index, tile.dora) }}</span
        >
      </span>
      <template v-for="operation in ctx.operationList" :key="operation.type">
        <button
          v-if="operation.player === handIndex"
          @click="mingPai(operation)"
        >
          {{ operation.typeDesc }}
        </button>
      </template>
    </div>
  </div>
  <button @click="gang">杠</button>
  <button @click="zimo">自摸</button>
</template>

<script lang="ts" setup>
import { useMachine } from '@xstate/vue';
import mjMachine from './machine/mahjong.machine';
import { reactive } from 'vue';
import { ctx, Tile, getDiscardTile, Operation } from './mahjong';
import { getTileName, getTileEmoji, sortTiles, findTileIndex } from './utils';

const { state, send } = useMachine(mjMachine, {
  devTools: true
});

const mf = reactive({
  a: [[], []]
});

function test() {
  ctx.hands[3].splice(0, 1);
}

function test2() {
  mf.a[1] = mf.a[1].filter(d => d);
}

function mingPai(operation: Operation) {
  const hand = ctx.hands[operation.player];
  const tile = operation.discardTile;

  ctx.hands[operation.player] = hand.filter(t => {
    return !operation.combo.includes(t);
  });

  ctx.calls[operation.player] = ctx.calls[operation.player].concat(
    operation.combo,
    tile
  );

  ctx.currentPlayer = operation.player;
  ctx.operationList = [];
  send('mingpai');
}

const zimo = () => {
  send('zimo');
};

const discard = (tile: Tile) => {
  send({
    type: 'discard',
    tile
  });
};
</script>
<style lang="less">
body {
  font-family: monospace;
}

.disabled {
  pointer-events: none;
  opacity: 0.4;
}

.label {
  display: inline-block;
  width: 100px;
}
.active {
  .label {
    color: red;
  }
}
.tile,
.called-tile {
  font-size: 20px;
}
.tile {
  cursor: pointer;
  &:hover {
    border: 1px solid blue;
  }
}
</style>
