load_code("helperFunctions");
load_code("evadeTarget");
load_code("merchantSkills");
load_code("mageSkills");
load_code("priestSkills");
load_code("rangerSkills");

//Hotkeys!
map_key("5", "snippet", "loadCharacters()");
map_key("6", "snippet", "initParty()");
map_key("7", "snippet", "stopCharacters()");

//Custom Settings
//Farming spots are found in G.maps.main
const merchantName = "Henk";
const characterNames = ["Paul", "Sibbo", "Matroklozz"];
let master = characterNames[0];
let hunterMaster = characterNames[0];
const hunterToggle = true;
let farmMonsterType = "crabx";
let farmMonsterFallback = "crabx";
let farmMap = getFarmingSpot(farmMonsterType, "map");
let farmCoord = getFarmingSpot(farmMonsterType, "coord");
const allowedMonsters = ["hen","rooster","goo","crab","bee","minimush","frog","squigtoad","osnake","snake","rat","armadillo","croc","squig","poisio","arcticbee","spider","tortoise","bat","scorpion","gscorpion","crabx","","","",""];
const requiresMaster = ["poisio","crabx","minimush","scorpion","gscorpion","tortoise","croc","spider","armadillo","bat","","","",""];

setInterval(main, 1000 / 4); // Loops every 1/4 seconds.
setInterval(tier2Actions, 5000); // Loops every 5 seconds.

function main(){

    //If Character is dead, respawn
    if (character.rip){
		setTimeout(respawn, 15000);
		return;
	}
	//Replenish Health and Mana
    usePotions();
	//If the master is moving, lay breadcrumbs
	if(master && character.name === master) masterBreadcrumbs();
    //If character is moving, do nothing
    if(is_moving(character) || smart.moving) return;
    //Loot everything
    loot();
	
	//Merchant Skills are Tier 2 actions
    if(character.ctype === "merchant") return;
	
	//Functions that cannot be in Tier 2 loop, because the target- / attack-
	//part would overrule them, but still only need to run every 5 sec.	
	if(new Date().getSeconds() % 5 === 0){
		log(character.name + " running t2-lite func");
		//Hunting
		if(hunterToggle
		   && character.ctype !== "merchant"){
			handleHuntQuest();
			updateFarmingSpot()
			log(character.name + " hunting quest handled, farm spot updated");
		}
		//Add more...
	}
	
	//Party follows master
	if(master && character.name !== master) followMaster();
    
    //Finds a suitable target and attacks it. Also returns the target!
    let target = getTarget();
    if(target){
		log(character.name + " got target " + target);
        //Kites Target
		//kiteTarget(target);
        //Circles Target
        //circleTarget(target);
        //Uses available skills
		//HINT: Offensive skills are only used if "master" is defined [To save mana]
        if(character.ctype === "mage") mageSkills(target);
        if(character.ctype === "priest") priestSkills(target);
        if(character.ctype === "ranger") rangerSkills(target, farmMonsterType);
        //Attacks the target
        autoFight(target);
    }else{		
        //Go to farming Area
		let coords = getFarmingSpot(farmMonsterType, "coord");
		if((!master 
		   || character.name === master)
		   && (Math.abs(character.x - coords.x) > 150
		  || Math.abs(character.y - coords.y) > 150)){
			log(character.name + " moving to farming spot");
			getFarmingSpot(farmMonsterType, "move");
		}
    }
}

function tier2Actions(){
	
	//Update farming spot
	updateFarmingSpot();
    
    //If character is moving, do nothing
    if(is_moving(character) || smart.moving) return;
    
    //Puts potions on Slots not transferred to merchant
    relocateItems();
	//Arranges Inventory without gaps
	tidyInventory();
    //Transfer loot to merchant
    transferLoot(merchantName);
    
    //Run Merchant Skills
    if(character.ctype === "merchant"){
        merchantSkills();
        return;
    }
}
