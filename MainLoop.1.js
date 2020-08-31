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
const merchantName = "Plutus";
const characterNames = ["Hierophant", "Magos", "Patroclus"];
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

// ######################################

//Handle Hunter Quest
function handleHuntQuest(){
	let monsterType;
	let huntedMonsters;
	if(hunterToggle){
		//Get the quest
		if(!character.s.monsterhunt){
			log(character.name + " has no hunterQuest" + character.name + " moving to monsterHunter");
			smart_move({to:"monsterhunter"}, () => {
				parent.socket.emit("monsterhunt");
				updateFarmingSpot();
				log(character.name + " moving to farming spot");
				getFarmingSpot(farmMonsterType, "move");
			});			
		//If character has a quest, handle it
		}else if(character.s.monsterhunt){
			monsterType = character.s.monsterhunt.id;
			huntedMonsters = JSON.parse(localStorage.getItem("huntedMonsters")) || [];
			//Check if quest can be pursued
			if(character.s.monsterhunt.c > 0 ){
				let alreadyAdded;
				huntedMonsters.forEach(element => {if(element.questGiver === character.name) alreadyAdded = true});
				if(allowedMonsters.indexOf(monsterType) !== -1 && !alreadyAdded ){
					huntedMonsters.unshift({monsterType: monsterType, timeStamp: Date.now() + character.s.monsterhunt.ms, questGiver: character.name});
					localStorage.setItem("huntedMonsters", JSON.stringify(huntedMonsters));
					log(character.name + " setting HunterQuest in locStor");
				}
			}
			//Turn in fulfilled quest
			if(character.s.monsterhunt.c === 0 ){
				log(character.name + " Fulfilled Hunter Quest");
				smart_move({to:"monsterhunter"}, () => {
					log(character.name + " moves to questGiver with FULFILLED quest");
					//Remove fulfilled quest from localStorage
					huntedMonsters.forEach((element, index) => {
						if(element.questGiver === character.name){
							huntedMonsters.splice(index, 1);
						}
					});
					localStorage.setItem("huntedMonsters", JSON.stringify(huntedMonsters));
					//Turn in quest
					parent.socket.emit("monsterhunt");
					//Get new quest
					parent.socket.emit("monsterhunt");
					//Update farming spot
					updateFarmingSpot();
					//Move to farming spot
					log(character.name + " moving to farming spot");
					getFarmingSpot(farmMonsterType, "move");
				});
			}
			//Remove quests older than 30 minutes
			huntedMonsters.forEach((element, index) => {
				if(element.timeStamp && Date.now() > element.timeStamp){
					huntedMonsters.splice(index, 1);
					localStorage.setItem("huntedMonsters", JSON.stringify(huntedMonsters));
					log(character.name + " Deleted old quest from locStor");
				}
			});
		}
	}
}

//Update farming spot.
//If a hunt is going on, go there
function updateFarmingSpot(){
	let huntedMonsters = JSON.parse(localStorage.getItem("huntedMonsters"));
	//Hunted Monsters can be not set, or an empty array
	//of length 0, that's why both must be checked
	if(hunterToggle && huntedMonsters && huntedMonsters.length > 0){
		farmMonsterType = huntedMonsters[huntedMonsters.length - 1].monsterType;
		farmMap = getFarmingSpot(farmMonsterType, "map");
		farmCoord = getFarmingSpot(farmMonsterType, "coord");
		requiresMaster.indexOf(farmMonsterType) !== -1 ? master =  hunterMaster	: master = "";
	}else{
		farmMonsterType = farmMonsterFallback;
		requiresMaster.indexOf(farmMonsterType) !== -1 ? master =  hunterMaster	: master = "";
	}
}
