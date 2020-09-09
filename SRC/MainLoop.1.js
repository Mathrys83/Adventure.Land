load_code("helperFunctions");
load_code("handleFighting");
load_code("handleHunting");
load_code("evadeTarget");
load_code("merchantSkills");
load_code("mageSkills");
load_code("priestSkills");
load_code("rangerSkills");

//Hotkeys!
map_key("5", "snippet", "loadCharacters()");
map_key("6", "snippet", "initParty()");
map_key("7", "snippet", "stopCharacters()");

//Custom buttons!
addButons();

//Custom Settings
//Farming spots are found in G.maps.main
const merchantName = "Plutus";
const characterNames = ["Hierophant", "Magos", "Patroclus"];
let master = "";
const hunterMaster = characterNames[0];
const hunterToggle = true;
let farmMonsterType = "crabx";
const farmMonsterFallback = "crabx";
let farmMap = getFarmingSpot(farmMonsterType, "map");
let farmCoord = getFarmingSpot(farmMonsterType, "coord");
const allowedMonsters = ["hen", "rooster", "goo", "crab", "bee", "minimush", "frog", "squigtoad", "osnake", "snake", "rat", "armadillo", "croc", "squig", "poisio", "arcticbee", "spider", "tortoise", "bat", "scorpion", "gscorpion", "crabx", "iceroamer", "", ""];
const requiresMaster = ["poisio", "crabx", "minimush", "scorpion", "gscorpion", "tortoise", "bat", "croc", "spider", "armadillo", "iceroamer", "", "", ""];

setInterval(main, 1000 / 4); // Loops every 1/4 seconds.
setInterval(tier2Actions, 5000); // Loops every 5 seconds.

function main() {
	
	//If Character is dead, respawn
	//is_moving(character) and smart.moving is TRUE even for DEAD characters
	//So the respawn code MUST be on top!
	if (character.rip) {
		setTimeout(respawn, 15000);
		return;
	}

	//If character is moving, do nothing
	if (is_moving(character) || smart.moving) return;
	
	//Replenish Health and Mana
	usePotions();
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
		//HINT: Offensive skills are only used if "master" is defined [To save mana]
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
	
	//If the master is moving, lay breadcrumbs
	if (master && character.name === master) masterBreadcrumbs();

	//If character is moving, do nothing
	if (is_moving(character) || smart.moving) return;

	//Hunting
	if (hunterToggle && character.ctype !== "merchant") handleHuntQuest();

	//Update farming spot
	updateFarmingSpot();

	//Puts potions in specific slots
	relocateItems();
	//Arranges Inventory without gaps
	tidyInventory();
	//Transfer loot to merchant
	if (character.ctype !== "merchant"){
		drinkPotions();
		transferLoot(merchantName);
	}

	//Run Merchant Skills
	if (character.ctype === "merchant") merchantSkills();
}
