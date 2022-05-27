import { Tile } from './mahjong';

const USE_EMOJI = true;

// Display
const tileEmojiList = [
  ['red🀝', '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'],
  ['red🀋', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'],
  ['red🀔', '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'],
  ['', '🀀', '🀁', '🀂', '🀃', '🀆', '🀅', '🀄']
];

function log(value) {
  console.log(value);
}

//Sort tiles
export function sortTiles(inputTiles: Tile[]) {
  let tiles = [...inputTiles];
  tiles = tiles.sort(function (p1, p2) {
    //Sort dora value descending
    return p2.doraValue - p1.doraValue;
  });
  tiles = tiles.sort(function (p1, p2) {
    //Sort index ascending
    return p1.index - p2.index;
  });
  tiles = tiles.sort(function (p1, p2) {
    //Sort type ascending
    return p1.type - p2.type;
  });
  return tiles;
}

//Returns the name for a tile
export function getTileName(tile: Tile, useRaw = true) {
  let name = '';
  if (tile.dora == true) {
    name = '0' + getNameForType(tile.type);
  } else {
    name = tile.index + getNameForType(tile.type);
  }

  if (!useRaw && USE_EMOJI) {
    return `${getTileEmoji(tile.type, tile.index, tile.dora)}`;
  } else {
    return name;
  }
}

//Returns the corresponding char for a type
function getNameForType(type) {
  switch (type) {
    case 0:
      return 'p';
    case 1:
      return 'm';
    case 2:
      return 's';
    case 3:
      return 'z';
    default:
      return '?';
  }
}

export function findTileIndex(tile: Tile, tiles: Tile[]) {
  return tiles.findIndex(t => {
    return t.index == tile.index && t.type == tile.type && t.dora == tile.dora;
  });
}

export function getTileEmoji(tileType, tileIdx, dora) {
  if (dora) {
    tileIdx = 0;
  }
  return tileEmojiList[tileType][tileIdx];
}

// //Get Emoji str by tile name
// function getTileEmojiByName(name) {
// 	let tile = getTileFromString(name);
// 	return getTileEmoji(tile.type, tile.index, tile.dora);
// }

// //Returns the corresponding char for a type
// export function getNameForType(type) {
// 	switch (type) {
// 		case 0:
// 			return "p";
// 		case 1:
// 			return "m";
// 		case 2:
// 			return "s";
// 		case 3:
// 			return "z";
// 		default:
// 			return "?";
// 	}
// }

// //Input string to get a tiles (e.g. "1m")
// function getTileFromString(inputString) {
// 	var type = 4;
// 	var dr = false;
// 	switch (inputString[1]) {
// 		case "p":
// 			type = 0;
// 			break;
// 		case "m":
// 			type = 1;
// 			break;
// 		case "s":
// 			type = 2;
// 			break;
// 		case "z":
// 			type = 3;
// 			break;
// 	}
// 	if (inputString[0] == "0") {
// 		inputString[0] = 5;
// 		dr = true;
// 	}
// 	if (type !== 4) {
// 		var tile = { index: parseInt(inputString[0]), type: type, dora: dr };
// 		tile.doraValue = getTileDoraValue(tile);
// 		return tile;
// 	}
// 	return null;
// }

// //Return sum of red dora/dora indicators for tile
// function getTileDoraValue(tile) {
// 	var dr = 0;

// 	if (getNumberOfPlayers() == 3) {
// 		if (tile.type == 3 && tile.index == 4) { //North Tiles
// 			dr = 1;
// 		}
// 	}

// 	for (let d of dora) {
// 		if (d.type == tile.type && getHigherTileIndex(d) == tile.index) {
// 			dr++;
// 		}
// 	}

// 	if (tile.dora) {
// 		return dr + 1;
// 	}
// 	return dr;
// }
