//Handle Hunter Quest
function handleHuntQuest() {
	if (character.ctype === "merchant") return;
	if (hunterToggle) {
		checkAndStoreHunterQuest();
		removeExpiredHunterQuests();
		getNewHunterQuest();
		returnHunterQuest();
	}
}

//If character has no hunter-quest, get one
function getNewHunterQuest() {
	if (character.ctype === "merchant") return;
	if (!character?.s?.monsterhunt) {
		log("Getting new hunterQuest");
		smart_move({ to: "monsterhunter" }, () => {
			parent.socket.emit("monsterhunt");
			checkAndStoreHunterQuest();
		});
	}
}

//If character has fulfilled a hunter-quest, turn it in
function returnHunterQuest() {
	if (character.ctype === "merchant") return;
	let huntedMonsters = get("huntedMonsters") || [];
	if (character?.s?.monsterhunt && character?.s?.monsterhunt?.c === 0) {
		//Turn in fulfilled quest
		log("Fulfilled Hunter Quest");
		smart_move({ to: "monsterhunter" }, () => {
			//Remove fulfilled quest from localStorage
			huntedMonsters.forEach((element, index) => {
				if (element.questGiver === character.name) {
					huntedMonsters.splice(index, 1);
				}
			});
			set("huntedMonsters", huntedMonsters);
			//Turn in quest
			parent.socket.emit("monsterhunt");
			//Get new quest
			parent.socket.emit("monsterhunt");
			checkAndStoreHunterQuest();
		});
	}
}

//Check if quest can be pursued. if so, store it in LocalStorage
function checkAndStoreHunterQuest() {
	if (character.ctype === "merchant") return;
	let huntedMonsters = get("huntedMonsters") || [];
	let monsterType = character?.s?.monsterhunt?.id;
	//Check if quest can be pursued
	if (monsterType && character?.s?.monsterhunt?.c > 0) {
		//If quest is already set, return
		for (element of huntedMonsters) if (element.questGiver === character.name) return;
		//If quest is not set, set it
		if (allowedMonsters.includes(monsterType)) {
			huntedMonsters.unshift({ monsterType: monsterType, questGiver: character.name, timeStamp: Date.now() + character.s.monsterhunt.ms });
			set("huntedMonsters", huntedMonsters);
			log("Setting HunterQuest in LocalStorage");
		}
	}
}

//Remove expired hunter-quests from LocalStorage
function removeExpiredHunterQuests() {
	if (character.ctype === "merchant") return;
	let huntedMonsters = get("huntedMonsters") || [];
	//Remove quests older than 30 minutes
	huntedMonsters.forEach((element, index) => {
		if (element?.timeStamp && Date.now() > element?.timeStamp) {
			huntedMonsters.splice(index, 1);
			set("huntedMonsters", huntedMonsters);
			log("Deleted old quest from LocalStorage");
		}
	});
}