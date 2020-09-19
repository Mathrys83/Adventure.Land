function loadCharacters(){
	characterNames.forEach((name, index) => {
		setTimeout(() => {if(Object.keys(get_active_characters()).indexOf(name) === -1) start_character(name, "MainLoop")}, index * 10000);
	});
}

function initParty(){
	for(name of characterNames){
		if(Object.keys(get_party()).indexOf(name) === -1) send_party_invite(name);
	}
}

function stopCharacters(){
	for(characterName in get_active_characters()){
		if(characterName !== character.name){
			stop_character(characterName);
			log("Stopped character " + characterName);
		}
	}
}

/*
function stopCharacters(){
	stop_character(characterNames[0]);
	stop_character(characterNames[1]);
	stop_character(characterNames[2]);
	log("Characters stopped!");
}
*/

function addButons(){
	add_bottom_button("move2Farm", "Move Farm", () => {
		getFarmingSpot(farmMonsterType, "move");
	});
	add_bottom_button("move2Main", "Move Main", () => {
		smart_move({to:"main"});
	});
	/*
	add_bottom_button("loadChar", "Load Char", () => {
		loadCharacters();
	});
	add_bottom_button("initPart", "Init Party", () => {
		initParty();
	});
	add_bottom_button("stopChar", "Stop Char", () => {
		stopCharacters();
	});
	*/
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

function transferLoot(merchantName){
	if(character.ctype === "merchant") return;
    let merchant = get_player(merchantName);
	let keepItems = ["hpot0", "mpot0", "hpot1", "mpot1",
						"elixirdex0", "elixirdex1", "elixirdex2",
						"elixirint0", "elixirint1", "elixirint2",
						//"elixirvit0", "elixirvit1", "elixirvit2",
						//"elixirstr0", "elixirstr1", "elixirstr2",
						//"elixirluck"
						];
    if(character.ctype !== "merchant"
       && merchant
       && merchant.owner === character.owner
       && distance(character, merchant) < 400){
        //Transfer Gold
        if(character.gold > 1000) send_gold(merchant, character.gold)
        //Transfer Items
		character.items.forEach((item, index) => {
			if(item && keepItems.indexOf(item.name) === -1) send_item(merchant, index, 9999);
		});
		log(character.name + " sent items to merchant.");
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
}

//on_party_invite gets called _automatically_ by the game on an invite 
function on_party_invite(name) {
    if (get_player(name) &&
		get_player(name).owner !== character.owner) return;
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

function drinkPotions(){
	if(character.ctype === "merchant") return;
	let potions = ["elixirdex0", "elixirdex1", "elixirdex2",
				   "elixirint0", "elixirint1", "elixirint2",
				   //"elixirvit0", "elixirvit1", "elixirvit2",
				   //"elixirstr0", "elixirstr1", "elixirstr2",
				   //"elixirluck"
				  ];
	if(!character.slots.elixir){
		for(const potion of potions){
			if(locate_item(potion) !== -1){
				consume(locate_item(potion));
				return;
			}
		}
	}
}

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
				&& get("MasterPos")){
			let masterPos = get("MasterPos");
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
		set("MasterPos", {map: character.map, x: Math.floor(character.x), y: Math.floor(character.y)});
	}
}

