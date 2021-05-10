load_code("helperFunctions");
load_code("handleFighting");
load_code("handleHunting");
load_code("handleFarming");
load_code("evadeTarget");
load_code("merchantSkills");
load_code("mageSkills");
load_code("priestSkills");
load_code("rangerSkills");
load_code("handleEvents");
load_code("handleCodeMessages");

//Hotkeys!
map_key("5", "snippet", "loadCharacters()");
map_key("6", "snippet", "initParty()");
map_key("7", "snippet", "stopCharacters()");

//Custom buttons!
addButtons();

/*
###################################################################

######################### Custom Settings #########################

								Adjust below variables to your needs

###################################################################

			The code works better with these items in your inventory:
					jacko, handofmidas, lantern [Priest & Mage only]

###################################################################
*/

//Name of your merchant
const merchantName = "Plutus";
//Name of your characters
const characterNames = ["Hierophant", "Magos", "Patroclus"];
//Designate a Master for hunting tough monsters
const hunterMaster = characterNames[0];
//Master for hunting tough monsters -> Handled by updateFarmingSpot()
let master = characterNames[0];
//Toggle if character can attack -> Handled by scareMonsters();
let attackToggle = true;
//Toggle the pursuit of Hunter Quests
const hunterToggle = true;
//Fishing Toggle
const fishingToggle = true;
//Mining Toggle
const miningToggle = true;
//Toggle the pursuit of Event-Monsters (like snowman, wabbit)
const eventMonsterToggle = true;
//Your characters will cycle through this array of monsters, farming a new monster every few hours!
//Fill in the monsters you want to farm. (Can be one or multiple monsters).
//IMPORTANT: 24 % allMonstersToFarm.length MUST be 0!!!
const allMonstersToFarm = ["bat", "bbpompom", "boar", "ghost", "xscorpion", "bigbird"];
//const allMonstersToFarm = ["poisio"];
//Monster you are currently farming -> Handled by updateFarmingSpot()
let farmMonsterType = scheduleFarming();
//Monsters your characters are allowed to hunt. Only enter monsters you are strong enough to defeat!
const allowedMonsters = [
	"hen", "rooster", "goo", "crab", "bee", "cutebee", "minimush", "frog",
	"squigtoad", "osnake", "snake", "rat", "armadillo", "croc", "squig",
	"poisio", "snowman", "porcupine", "arcticbee", "spider", "tortoise",
	"stoneworm", "bat", "goldenbat", "wabbit", "scorpion", "gscorpion",
	"iceroamer", "crabx", "jr", "greenjr", "bbpompom", "boar", "ghost",
	"mole", "wolfie", "wolf", "xscorpion", "bigbird",
	"phoenix", "fvampire", "mvampire", "grinch"];
/*
Monsters that are too strong for a single character are listed below.
Your Master-Character will choose a monster, which the whole party will then attack.
Also: Characters will start using their offensive skills if a monster is on this list
(They don't use offensive skills against weak monsters, to conserve MP)
*/
const requiresMaster = [
	"snowman", "stoneworm", "bat", "goldenbat", "iceroamer", "crabx",
	"jr", "greenjr", "bbpompom", "booboo", "prat", "boar", "ghost",
	"mummy", "mole", "wolfie", "wolf", "xscorpion", "bigbird",
	"wabbit", "phoenix", "fvampire", "mvampire", "grinch"];
//Monsters listed here always get attacked on sight
const specialMonsters = ["cutebee", "snowman", "goldenbat",
	"wabbit", "phoenix", "fvampire", "mvampire", "grinch"];
//Event-Monster to farm
//eventMonsters is sequential! Order matters here! eventMonsters[0] gets attacked first, then eventMonsters[1]...
//All Event-Monsters: pinkgoo, wabbit, franky, grinch, dragold, mrpumpkin, mrgreen
const eventMonsters = ["wabbit", "snowman", "grinch"];
//Items to upgrade
const itemsToUpgrade = [
	"sshield", "slimestaff", "staffofthedead", "maceofthedead", "pmace",
	"firebow", "frostbow", "firestaff", "t2bow", "gphelmet", "xmassweater",
	"cape", "bcape", "harbringer", "mcape", "oozingterror", "bowofthedead",
	//Hunter Sets
	"mchat", "mcgloves", "mcpants", "mcarmor", "mcboots",
	"mmhat", "mmgloves", "mmpants", "mmarmor", "mmshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mrnhat", "mrngloves", "mrnpants", "mrnarmor", "mrnboots",
	"merry"];
//Wanted items - Checks Ponty for the items listed below
const wantedItems = ["lostearring", "spidersilk", "shadowstone",
	"cdarktristone", "lantern", "talkingskull", "jacko", "rabbitsfoot",
	"poker", "handofmidas", "powerglove", "goldenpowerglove", "mpxgloves",
	"stealthcape", "warpvest", "oxhelmet", "cyber", "starkillers",
	"suckerpunch", "cring", "cdarktristone", "fcape", "vcape", "goldring",
	"trigger", "ringofluck", "zapper", "vring", "sanguine", "amuletofm",
	"molesteeth", "cearring", "lostearring", "mpxbelt", "northstar",
	"mpxamulet", "t2intamulet", "t2dexamulet", "orbofint", "orbofdex",
	"charmer", "talkingskull", "ftrinket", "t3bow", "crossbow",
	"harbringer", "firestaff", "firebow", "scythe", "dragondagger",
	"hdagger", "gstaff", "lmace", "dartgun", "vstaff", "vdagger",
	"vsword", "gbow", "offeringp", "t2quiver", "wbook1", "mshield",
	"sshield", "electronics", "bronzeingot", "goldnugget",
	"platinumnugget", "offering", "emotionjar", "cxjar",
	"essenceofnature", "essenceoffire", "essenceoffrost",
	"essenceofgreed", "pvptoken", "funtoken", "monstertoken"];
//The merchant auto-crafts below listed items, if he has the ingredients in his inventory
//Also: If an item is an ingredient for a recipe you list here, it won't get compounded
const itemsToCraft = [
	"rod", "pickaxe", "ctristone", "firebow", "frostbow", "fierygloves", "wingedboots",
	"elixirdex1", "elixirdex2", "elixirint1", "elixirint2", "elixirvit1", "elixirvit2",
	"xbox", "basketofeggs"];
//Items to be dismantled are listed below
//Auto-dismantle items to get rare crafting-materials
const itemsToDismantle = ["fireblade", "daggerofthedead", "swordofthedead", "spearofthedead", "goldenegg", "", ""];
//Smart-Moveable Object of your farm-location -> Handled by updateFarmingSpot()
//Farming spots are found in G.maps.main
let farmingSpotData = getFarmingSpot(farmMonsterType, "getFarmingSpotData");

setInterval(main, 1000 / 4); // Main Loop: Repeats 4 times per second.
setInterval(tier2Actions, 1000); // Tier 2 Loop: Repeats every 1 seconds.
setInterval(tier3Actions, 5000); // Tier 3 Loop: Repeats every 5 seconds.

//This loop runs 4 times per second
function main() {

	//Respawn Code is Tier 2
	if (character.rip) return;

	//Replenish Health and Mana
	usePotions();

	//If low on health, scare monsters away
	scareMonsters();

	//Loot everything [Must be quick interval, or chests get left behind]
	//loot();
	lootMidas();

	//If character is moving, do nothing
	if (is_moving(character)) return;

	//Merchant Skills are Tier 3 actions
	if (character.ctype === "merchant") return;

	//If character has enough HP and MP, attack!
	if (character.hp > (character.max_hp * 0.6) && character.mp > (character.max_mp * 0.4)) attackToggle = true;

	//Finds a suitable target and attacks it.
	let target = getTarget();
	if (target) {
		//log(character.name + " got target " + target);

		//Kites Target
		//kiteTarget(target);

		//Circles Target
		//circleTarget(target);

		//Equip Lantern for hard monsters [Only Priest & Mage - Ranger can't equip it!]
		if (character.ctype === "priest" || character.ctype === "mage") equipLantern(target.mtype);

		//Uses available skills
		//HINT: Offensive skills are only used if "master" is defined [To save Mana]
		if (character.ctype === "mage") mageSkills(target);
		if (character.ctype === "priest") priestSkills(target);
		if (character.ctype === "ranger") rangerSkills(target, farmMonsterType);
		//Attacks the target
		autoFight(target);
	} else {
		//Go to farming Area
		if ((!master
			|| character.name === master)
			&& (character.map !== farmingSpotData.map
				|| (Math.abs(character.x - farmingSpotData.x) > 150
					|| Math.abs(character.y - farmingSpotData.y) > 150))) {
			getFarmingSpot(farmMonsterType, "move");
		}
	}
}

//This loop runs every 1 second
function tier2Actions() {

	//If Character is dead, respawn
	//is_moving(character) and smart.moving is TRUE even for DEAD characters
	//So the respawn code MUST be on top!
	if (character.rip) {
		setTimeout(respawn, 15000);
		return;
	}

	//If merchant moves with the stand open, close it
	if (is_moving(character) && character.ctype === "merchant" && character.stand) close_stand();

	//Merchant Skills are Tier 3 actions
	if (character.ctype === "merchant") return;

	//If the master is moving, he lays breadcrumbs
	if (master && character.name === master) masterBreadcrumbs();

	//If character is moving, do nothing
	if (is_moving(character)) return;

	//Party follows master [Except the merchant]
	if (master && character.name !== master) followMaster();
}

//This loop runs every 5 seconds
function tier3Actions() {

	//Respawn Code is Tier 2
	if (character.rip) return;

	//Update farming spot [Needs to be updated, even when moving]
	updateFarmingSpot();

	//If character is moving, do nothing
	if (is_moving(character)) return;

	//Get Holiday Buffs
	//getHolidayBuff();

	//Puts potions in specific slots
	relocateItems();

	//Arranges Inventory without gaps
	//[Delay 500ms to not mess with other functions using Inventory]
	setTimeout(tidyInventory, 500);

	//Functions for non-merchant characters
	if (character.ctype !== "merchant") {
		requestPotions();
		drinkElixirs();
		transferLoot(merchantName);
		if (hunterToggle) handleHuntQuest();
	}

	//Run Merchant Skills
	if (character.ctype === "merchant") merchantSkills();
}

