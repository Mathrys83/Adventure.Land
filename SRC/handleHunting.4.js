//Update farming spot.
//If a hunt is going on, go there
function updateFarmingSpot(){
	let huntedMonsters = get("huntedMonsters");
	//Hunted Monsters can be not set, or an empty array
	//of length 0, that's why both must be checked
	if(hunterToggle
	   && huntedMonsters
	   && huntedMonsters.length > 0){
		farmMonsterType = huntedMonsters[huntedMonsters.length - 1].monsterType;
		farmMap = getFarmingSpot(farmMonsterType, "map");
		farmCoord = getFarmingSpot(farmMonsterType, "coord");
		requiresMaster.indexOf(farmMonsterType) !== -1 ? master =  hunterMaster	: master = "";
	}else{
		farmMonsterType = farmMonsterFallback;
		requiresMaster.indexOf(farmMonsterType) !== -1 ? master =  hunterMaster	: master = "";
	}
}

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
			});			
		//If character has a quest, handle it
		}else if(character.s.monsterhunt){
			monsterType = character.s.monsterhunt.id;
			huntedMonsters = get("huntedMonsters") || [];
			//Check if quest can be pursued
			if(character.s.monsterhunt.c > 0 ){
				let alreadyAdded;
				huntedMonsters.forEach(element => {if(element.questGiver === character.name) alreadyAdded = true});
				if(allowedMonsters.indexOf(monsterType) !== -1 && !alreadyAdded ){
					huntedMonsters.unshift({monsterType: monsterType, timeStamp: Date.now() + character.s.monsterhunt.ms, questGiver: character.name});
					set("huntedMonsters", huntedMonsters);
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
					set("huntedMonsters", huntedMonsters);
					//Turn in quest
					parent.socket.emit("monsterhunt");
					//Get new quest
					parent.socket.emit("monsterhunt");
					//Update farming spot
					updateFarmingSpot();
				});
			}
			//Remove quests older than 30 minutes
			huntedMonsters.forEach((element, index) => {
				if(element.timeStamp && Date.now() > element.timeStamp){
					huntedMonsters.splice(index, 1);
					set("huntedMonsters", huntedMonsters);
					log(character.name + " Deleted old quest from locStor");
				}
			});
		}
	}
}