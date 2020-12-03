//Update farming spot.
//If a hunt is going on, go there
function updateFarmingSpot() {
  let huntedMonsters = get("huntedMonsters");
  //Hunted Monsters can be not set, or an empty array
  //of length 0, that's why both must be checked
  if (hunterToggle
    && huntedMonsters
    && huntedMonsters.length > 0) {
    farmMonsterType = huntedMonsters[huntedMonsters.length - 1].monsterType;
    farmMap = getFarmingSpot(farmMonsterType, "map");
    farmCoord = getFarmingSpot(farmMonsterType, "coord");
  } else {
    farmMonsterType = scheduleFarming();
  }
  requiresMaster.includes(farmMonsterType) ? master = hunterMaster : master = "";
}

//Cycles through allMonstersToFarm, returning a different monster depending on the time of the day
function scheduleFarming() {
  let slotSize = 24 / allMonstersToFarm.length;
  let carryOver = 0;
  for (const monster of allMonstersToFarm) {
    for (let i = 0; i < slotSize; i++) {
      if (i + carryOver === new Date().getHours()) return monster;
    }
    carryOver += slotSize;
  }
}

/*
Finds Farming Spot with most monsters of a given type
Allowed "action" arguments:
  "move" -> Moves character to farming spot
  "map" -> Returns the map where the monster is located
  "coord" -> Returns the coordinates on the map where the monster is located
*/
function getFarmingSpot(farmMonsterType = "crab", action = "move") {
  const availableMaps = [
    "main",
    "woffice",
    "tunnel",
    "bank",
    "cave",
    "arena",
    "tavern",
    "mansion",
    "level1",
    "hut",
    "halloween",
    "mtunnel",
    "test",
    "cyberland",
    "winterland",
    "desertland",
    "resort_e",
    "level2",
    "spookytown",
    "winter_inn",
    "winter_cave",
    "level2n",
    "level2s",
    "level3",
    "level2e",
    "level2w",
    "winter_inn_rooms",
    "level4"
  ];
  //Find all spawns of the monster
  let farmingSpots = [];
  for (map in G.maps) {
    if (!availableMaps.includes(map)) continue;
    for (monsters in G.maps[map].monsters) {
      let monster = G.maps[map].monsters[monsters];
      if (monster.type === farmMonsterType) {
        farmingSpots.push({
          map: map,
          monster: monster
        });
      }
    }
  }
  //Find the spawn with most monsters
  let mostMonsters = 0;
  let indexMostMonsters = 0;
  farmingSpots.forEach((farmingSpot, index) => {
    if (farmingSpot.monster.count > mostMonsters) {
      mostMonsters = farmingSpot.monster.count;
      indexMostMonsters = index;
    }
  })
  //Move to farming spot
  //monsterBoundary holds the boundaries of the monster-spawn (for better readability)
  let monsterBoundary = farmingSpots[indexMostMonsters].monster.boundary;
  if (action === "move") {
    //Switch Map if needed
    if (character.map != farmingSpots[indexMostMonsters].map) {
      log("Moving to farming spot, on another map, switching map");
      smart_move({ to: farmingSpots[indexMostMonsters].map });
      //If Map correct, go to Monster
    } else {
      log("Moving to farming spot, on same map, using coordinates");
      smart_move({ x: Math.floor(monsterBoundary[0] + ((monsterBoundary[2] - monsterBoundary[0]) / 2)), y: Math.floor(monsterBoundary[1] + ((monsterBoundary[3] - monsterBoundary[1]) / 2)) }).then((data) => {
        // On success
        //If there is no master, spread the characters around inside the farming spot, for more efficiency
        //if (!master) xmove(Math.floor(Math.random() * (-100 - 100) + 100), Math.floor(Math.random() * (-100 - 100) + 100));
      }).catch((data) => {
        if (data.reason === "failed") {
          //On fail 
          // Path not found
          log("Path to farming spot using coordinates not found, moving to Main!");
          smart_move("main");
        }
      });
    }
    //Return the map to farm on
  } else if (action === "map") {
    return farmingSpots[indexMostMonsters].map;
    //Return coordinates where the monsters are
  } else if (action === "coord") {
    return {
      x: Math.floor(monsterBoundary[0] + ((monsterBoundary[2] - monsterBoundary[0]) / 2)),
      y: Math.floor(monsterBoundary[1] + ((monsterBoundary[3] - monsterBoundary[1]) / 2))
    }
  }
}