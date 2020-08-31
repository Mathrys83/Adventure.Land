function loadCharacters(){
	setTimeout(() => {if(Object.keys(get_active_characters()).indexOf(characterNames[0]) === -1) start_character(characterNames[0], "MainLoop")}, 10);
	setTimeout(() => {if(Object.keys(get_active_characters()).indexOf(characterNames[1]) === -1) start_character(characterNames[1], "MainLoop")}, 6000);
	setTimeout(() => {if(Object.keys(get_active_characters()).indexOf(characterNames[2]) === -1) start_character(characterNames[2], "MainLoop")}, 12000);
	//setTimeout(() => start_character(characterNames[2], "MainLoop"), 12000);
	log("Loading Characters...");
}

function initParty(){
	send_party_invite(characterNames[0]);
	send_party_invite(characterNames[1]);
	send_party_invite(characterNames[2]);
	log("Party Invites sent!");
}

function stopCharacters(){
	stop_character(characterNames[0]);
	stop_character(characterNames[1]);
	stop_character(characterNames[2]);
	log("Characters stopped!");
}

function getFarmingSpot(farmMonsterType = "crab", action = "move"){
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
	for (map in G.maps){
		if(availableMaps.indexOf(map) === -1 ) continue;
		for(monsters in G.maps[map].monsters){
			let monster = G.maps[map].monsters[monsters];
			if(monster.type === farmMonsterType){
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
	farmingSpots.forEach((farmingSpot, index) =>  {
		if(farmingSpot.monster.count > mostMonsters){
			mostMonsters = farmingSpot.monster.count;
			indexMostMonsters = index;
		}})
	//Move to farmong spot
	if(action === "move"){
		//Switch Map if needed
		if(character.map != farmingSpots[indexMostMonsters].map){
			log("Moving to farming spot, on another map, switching map");
			smart_move({to:farmingSpots[indexMostMonsters].map});
			//If Map correct, go to Monster
		}else{
			log("Moving to farming spot, on same map, using coordinates");
			smart_move({x:Math.floor(farmingSpots[indexMostMonsters].monster.boundary[0] + ((farmingSpots[indexMostMonsters].monster.boundary[2] - farmingSpots[indexMostMonsters].monster.boundary[0]) / 2)), y:Math.floor(farmingSpots[indexMostMonsters].monster.boundary[1] + ((farmingSpots[indexMostMonsters].monster.boundary[3] - farmingSpots[indexMostMonsters].monster.boundary[1]) / 2))}).then(function(data){
				// on success
				}).catch(function(data) {
				  if (data.reason === "failed") {
					  // Path not found
					  log(character.name + "Path to farming spot using coordinates not found, moving to Main!");
					  smart_move("main");
				  }
				});
		}
	//Return the map
	}else if(action === "map"){
		return farmingSpots[indexMostMonsters].map;
	//Return coordinates
	}else if(action === "coord"){
		return {x:Math.floor(farmingSpots[indexMostMonsters].monster.boundary[0] + ((farmingSpots[indexMostMonsters].monster.boundary[2] - farmingSpots[indexMostMonsters].monster.boundary[0]) / 2)), y:Math.floor(farmingSpots[indexMostMonsters].monster.boundary[1] + ((farmingSpots[indexMostMonsters].monster.boundary[3] - farmingSpots[indexMostMonsters].monster.boundary[1]) / 2))}
	}
}

function validateTarget(target){
	if(target 
	   && target.visible
	   && parent.entities[target.id]
	   && is_in_range(target,"attack")
	   && !target.dead
	   && target !== null){
		return true;
	}else{
		return false;
	}
}

function getTarget(){

	let target = get_targeted_monster();
	if(validateTarget(target)){
		return target;
	}else{
		change_target(null);
	}
	//If there is no master, or character is master, choose target freely
	if((!master && !target) || character.name == master){
		//Returns monster that targets character
		target = get_nearest_monster({
			target:character.name
		});
		if(validateTarget(target)){
			log(character.name + " Target monster that targets character");
			change_target(target);
			return target;
		}
		//Returns monster that targets party-member
		parent.party_list.forEach(partyMemberName => {
			target = get_nearest_monster({target:partyMemberName});
			if(validateTarget(target)){
				log(character.name + " Target monster that targets party-member");
				change_target(target);
				return target;
			}
		});
		//Returns any monster that targets nobody
		target = get_nearest_monster({
			type:farmMonsterType,
			no_target:true
		});
		if(validateTarget(target)){
			log(character.name + " Target monster that targets nobody");
			change_target(target);
			return target;
		}
	//If there is a master, target masters target
	} else if(master
			  && get_player(master) 
			  && get_player(master).target
			  && character.name !== master){
		/*
		get_player(master).target only returns the target ID,
		NOT the ENTITY (Object)!
		We therefor have to search parent.entities[] for the target ID,
		which will return an ENTITY (Object) again!
		The upper part works, because get_nearest_monster()
		returns ENTITIES, too!
		*/
		target = parent.entities[get_player(master).target];
		if(validateTarget(target)){
			log(character.name + " Target master's target");
			change_target(target);
			return target;
		}
	}else{
		change_target(null);
		return null;
	}
}

function autoFight(target){
	if(validateTarget(target)){	
		if(!is_in_range(target, "attack")){
			log(character.name + "Target not in range, moving to it");
			xmove(
				character.x + Math.floor((target.x -character.x) * 0.3),
				character.y + Math.floor((target.y - character.y) * 0.3)
			);
		}
		else if (!is_on_cooldown("attack")){
			attack(target).then((message) => {
				reduce_cooldown("attack", character.ping);
			}).catch((message) => {
				log(character.name + " attack failed: " + message.reason);
			});
		}
	}
}

function transferLoot(merchantName){
    let merchant = get_player(merchantName);
    if(character.ctype === "merchant") return;
    if(character.ctype !== "merchant"
       && merchant
       && merchant.owner === character.owner
       && distance(character, merchant) < 400){
        //Transfer Gold
        if(character.gold > 1000) send_gold(merchant, character.gold)
        //Transfer Items
        if(character.items.filter(element => element).length > 4){
            for(let i = 0; i <= 34; i++){
                send_item(merchant, i, 9999);
            }
            log(character.name + " sent items to merchant.");
        }
    }   
}

function tidyInventory(){
	for(let i = 34; i > 0; i--){
		if(character.items[i] && !character.items[i-1]){
			swap(i, i-1)
			log("Tidying Inventory... Slot: " + i);
		}
	}
}

function relocateItems(){
    
    if(locate_item("hpot1") !== -1 
       && locate_item("hpot1") !== 35)  swap(locate_item("hpot1"), 35);
    if(locate_item("mpot1") !== -1 
       && locate_item("mpot1") !== 36) swap(locate_item("mpot1"), 36);
    if(locate_item("hpot0") !== -1 
       && locate_item("hpot0") !== 37) swap(locate_item("hpot0"), 37);
    if(locate_item("mpot0") !== -1 
       && locate_item("mpot0") !== 38)swap(locate_item("mpot0"), 38);
    //Compound Scroll
    if(locate_item("cscroll0") !== -1 
       && locate_item("cscroll0") !== 39)swap(locate_item("cscroll0"), 39);
    //Upgrade Scroll
    if(locate_item("scroll0") !== -1 
       && locate_item("scroll0") !== 40)swap(locate_item("scroll0"), 40);
}

//on_party_invite gets called _automatically_ by the game on an invite 
function on_party_invite(name) {
    if (get_player(name).owner != character.owner) return;
    accept_party_invite(name);
}

//Replenish Health and Mana
function usePotions(){
    if(!character.rip){
		//If character has at least half of maxHP but no Mana, use Mana Potion
		if(!is_on_cooldown("use_mp")
		   && character.hp > (character.max_hp / 2)
		   && character.mp < (character.max_mp / 5)
		   && (locate_item("mpot1") !== -1 || locate_item("mpot0") !== -1)){
			if(locate_item("mpot1") !== -1) consume(locate_item("mpot1"));
			if(locate_item("mpot0") !== -1) consume(locate_item("mpot0"));
		//If character has no potions, generate them
		}else if(!is_on_cooldown("use_hp") || !is_on_cooldown("use_mp")
				&& (character.hp < (character.max_hp - 150)
				|| character.mp < (character.max_mp - 250))
				&& locate_item("mpot0") === -1
				&& locate_item("mpot1") === -1
				&& locate_item("hpot0") === -1
				&& locate_item("hpot1") === -1){ 
				use_hp_or_mp();
		}else if(!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - 400) && locate_item("hpot1") !== -1)){
				consume(locate_item("hpot1"));
		}else if(!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - 500) && locate_item("mpot1") !== -1)){ 	
				consume(locate_item("mpot1"));
		}else if(!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - 200) && locate_item("hpot0") !== -1)){ 
				consume(locate_item("hpot0"));
		}else if(!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - 300) && locate_item("mpot0") !== -1)){ 
				consume(locate_item("mpot0"));
		}
	}
}

//#################################
/*
function usePotions(healthPotThreshold = 0.9, manaPotThreshold = 0.9){
    if(!character.rip
        && (character.hp < (character.max_hp - 200)
        || character.mp < (character.max_mp - 300))) use_hp_or_mp();
}
*/


//Follow master character
function followMaster(){
	if(master && character.name !== master){ 	
		//If master is on screen, follow him
		if(get_player(master)){
			let theMaster = get_player(master);
			if(Math.abs(character.x - theMaster.x) > 20 || Math.abs(character.y - theMaster.y) > 20){
				log("Following Master with Get_Player");
				xmove(theMaster.x, theMaster.y); 
			}
		}
		//If the master is too far away,
		//followers read masters location from localStorage
		else if(!get_player(master)
				&& localStorage.getItem("MasterPos")){
			let masterPos = JSON.parse(localStorage.getItem("MasterPos"));
			if(character.map !== masterPos.map){
				log("Following Master Map from Local Storage");
				smart_move(masterPos.map);
			}else if(Math.abs(character.x - masterPos.x) > 20 || Math.abs(character.y - masterPos.y) > 20){ 
				log("Following Master Coordinates from Local Storage");
				xmove(masterPos.x, masterPos.y); 
			}
		}
	}
}

//Master character lays breadcrumbs
function masterBreadcrumbs(){
	//Master writes location to localStorage
	if(master && character.name === master){
		localStorage.setItem("MasterPos", JSON.stringify({map: character.map, x: Math.floor(character.x), y: Math.floor(character.y)}));
	}
}

