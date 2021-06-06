//Update farming spot.
//1. Check for Event-Monsters
//2. Do Hunting-Quests
//3. Regular farming
function updateFarmingSpot() {
	checkAndStoreHunterQuest();
	removeExpiredHunterQuests();
	const huntedMonsters = get("huntedMonsters") || [];
	//Check for rare Event-Monsters
	if (eventMonsterToggle
		&& findEventMonsters("getMonster")) {
		farmMonsterType = findEventMonsters("getMonster");
		//Hunted Monsters can be not set, or an empty array
		//of length 0, that's why both must be checked
	} else if (hunterToggle
		&& huntedMonsters
		&& huntedMonsters.length > 0) {
		farmMonsterType = huntedMonsters[huntedMonsters.length - 1].monsterType;
	} else {
		farmMonsterType = scheduleFarming();
	}
	//No matter if a hunt / event is going on, always update farmingSpotData
	farmingSpotData = getFarmingSpotData(farmMonsterType);
	//Adjust master according to monster difficulty
	master = requiresMaster.includes(farmMonsterType) ? hunterMaster : "";
}

//Cycles through allMonstersToFarm, returning a different monster depending on the time of the day
function scheduleFarming() {
	const slotSize = 24 / allMonstersToFarm.length;
	let carryOver = 0;
	for (const monster of allMonstersToFarm) {
		for (let i = 0; i < slotSize; i++) {
			if (i + carryOver === new Date().getHours()) return monster;
		}
		carryOver += slotSize;
	}
}

//Finds Farming Spot with most monsters of a given type
function getFarmingSpotData(farmMonsterType = "crab") {

	//Special logic to hunt rare Event-Monsters
	if (eventMonsters.includes(farmMonsterType)) {
		return findEventMonsters("getFarmingSpotData");
	} else {
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
		});


		//###################### Returns farmingSpotData ######################

		//monsterBoundary holds the boundaries of the monster-spawn (for better readability)
		const monsterBoundary = farmingSpots[indexMostMonsters]?.monster?.boundary;
		//Half of X and Y of monsterBoundary [The rectangle monsters spawn in]
		const farmSpotCenterX = Math.floor(monsterBoundary[0] + ((monsterBoundary[2] - monsterBoundary[0]) / 2));
		const farmSpotCenterY = Math.floor(monsterBoundary[1] + ((monsterBoundary[3] - monsterBoundary[1]) / 2));

		//Returns (dynamic) Monster Spawn
		return {
			map: farmingSpots[indexMostMonsters].map,
			x: farmSpotCenterX,
			y: farmSpotCenterY,
		}
	}
}

//Find Event-Monsters (like snowman, wabbit)
function findEventMonsters(action) {
	for (const monster of eventMonsters) {
		//All properties have to be present to avoid smart-move errors.
		//(x and y are not present at spawn, but a few seconds later)
		if (parent.S?.[monster]?.live
			&& parent.S?.[monster]?.map
			&& parent.S?.[monster]?.x
			&& parent.S?.[monster]?.y) {
			if (action === "getMonster") {
				return monster;
			} else if (action === "getFarmingSpotData") {
				return {
					map: parent.S[monster].map,
					x: Math.round(parent.S[monster].x),
					y: Math.round(parent.S[monster].y)
				}
			}
		}
	}
}
