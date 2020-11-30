load_code("helperFunctions");
load_code("handleFighting");
load_code("handleHunting");
load_code("handleFarming");
load_code("evadeTarget");
load_code("merchantSkills");
load_code("mageSkills");
load_code("priestSkills");
load_code("rangerSkills");
load_code("getHolidayBuff");

//Hotkeys!
map_key("5", "snippet", "loadCharacters()");
map_key("6", "snippet", "initParty()");
map_key("7", "snippet", "stopCharacters()");

//Custom buttons!
addButons();

/*
###################################################################

######################### Custom Settings ##########################

Adjust below values to your needs

###################################################################
*/

//Name of your merchant
const merchantName = "Plutus";
//Name of your characters
const characterNames = ["Hierophant", "Magos", "Patroclus"];
//Designate a Master for hunting tough monsters
const hunterMaster = characterNames[0];
//Master for hunting tough monsters- Handled by updateFarmingSpot()
let master = "";
//Toggle the pursuit of Hunter Quests
const hunterToggle = true;
//Your characters will cycle through this array of monsters, farming a new monster every few hours!
//Fill in the monsters you want to farm. (Can be one or multiple monsters). IMPORTANT: 24 % allMonstersToFarm.length MUST be 0!!!
const allMonstersToFarm = ["iceroamer", "porcupine", "croc", "armadillo", "crabx", "iceroamer"];
//Monster you are currently farming - Handled by updateFarmingSpot()
let farmMonsterType = scheduleFarming();
//Monsters your characters are allowed to farm. Only enter monsters you are strong enough to defeat!
const allowedMonsters = ["hen", "rooster", "goo", "crab", "bee", "minimush", "frog", "squigtoad", "osnake", "snake", "rat", "armadillo", "croc", "squig", "poisio", "snowman", "porcupine", "arcticbee", "spider", "tortoise", "bat", "scorpion", "gscorpion", "iceroamer", "crabx", ""];
//Monsters that are too strong for a single character are listed here.
//Your Master-Character will choose a monster, which the whole party will then attack.
//Also: Characters will start using their offensive skills if a monster is on this list (They don't use skills against weak monsters, conserve MP)
const requiresMaster = ["poisio", "crabx", "scorpion", "gscorpion", "tortoise", "bat", "spider", "iceroamer", "", "", ""];
//Merchant auto-crafts below items if he has the ingredients in his inventory
//Also: If an item is an ingredient for a recipe you list here, it won't get compounded
const itemsToCraft = ["ctristone", "elixirdex1", "elixirdex2", "elixirint1", "elixirint2", "elixirvit1", "elixirvit2", "fierygloves", "wingedboots", "xbox"];
//The map you farm on
//Farming spots are found in G.maps.main
let farmMap = getFarmingSpot(farmMonsterType, "map");
//The coordinates of your farming spot on the map
let farmCoord = getFarmingSpot(farmMonsterType, "coord");

setInterval(main, 1000 / 4); // Main Loop: Repeats every 1/4 seconds.
setInterval(tier2Actions, 5000); // Tier 2 Loop: Repeats every 5 seconds.

function main() {

	//If Character is dead, respawn
	//is_moving(character) and smart.moving is TRUE even for DEAD characters
	//So the respawn code MUST be on top!
	if (character.rip) {
		setTimeout(respawn, 15000);
		return;
	}

	//Replenish Health and Mana
	usePotions();

	//If character is moving, do nothing
	if (is_moving(character) || smart.moving) return;

	//Loot everything
	loot();

	//Merchant Skills are Tier 2 actions
	if (character.ctype === "merchant") return;

	//Party follows master
	if (master && character.name !== master) followMaster();

	//Finds a suitable target and attacks it.
	let target = getTarget();
	if (target) {
		//log(character.name + " got target " + target);
		//Kites Target
		//kiteTarget(target);
		//Circles Target
		//circleTarget(target);
		//Uses available skills
		//HINT: Offensive skills are only used if "master" is defined [To save Mana]
		if (character.ctype === "mage") mageSkills(target);
		if (character.ctype === "priest") priestSkills(target);
		if (character.ctype === "ranger") rangerSkills(target, farmMonsterType);
		//Attacks the target
		autoFight(target);
	} else {
		//Go to farming Area
		let coords = getFarmingSpot(farmMonsterType, "coord");
		if ((!master
			|| character.name === master)
			&& (Math.abs(character.x - coords.x) > 150
				|| Math.abs(character.y - coords.y) > 150)) {
			log(character.name + " moving to farming spot");
			getFarmingSpot(farmMonsterType, "move");
		}
	}
}

function tier2Actions() {

	//If the master is moving, he lays breadcrumbs
	if (master && character.name === master) masterBreadcrumbs();

	//If character is moving, do nothing
	if (is_moving(character) || smart.moving) return;

	//Get Holiday Buffs
	getHolidayBuff();

	//Hunting
	if (hunterToggle && character.ctype !== "merchant") handleHuntQuest();

	//Update farming spot
	updateFarmingSpot();

	//Puts potions in specific slots
	relocateItems();
	//Arranges Inventory without gaps
	tidyInventory();
	//Transfer loot to merchant
	if (character.ctype !== "merchant") {
		drinkPotions();
		transferLoot(merchantName);
	}

	//Run Merchant Skills
	if (character.ctype === "merchant") merchantSkills();
}
