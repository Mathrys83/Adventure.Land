let reserveMoney = 1000000;
let minCompoundScrolls = 100;
let trashName = ["cclaw", "crabclaw", "shoes1", "coat1", "pants1",
				"wshoes", "ink", "spores", "beewings", "wcap", "bfur", 
				"firestaff", "strearring", "stramulet", 
				"wattire", "poison", "rattail", "wbreeches", "gslime", "cscale", 
				"seashell", "ascale", "shoes", "lotusf", "pants", "spear", 
				"spidersilk", "sstinger", "snakefang", "smush", "spores", "frogt", 
				"gloves1", "stinger", "wgloves", "snakeoil", "dstones", "helmet1", 
				"bwing", "tshirt0", "tshirt1", "tshirt2", "", "", "", "",
				 "", "", "", "", "", "", "", "", "", "", "", "",
				 "", "", "", "", "", "", "", "", "", "", "", "",
				//Seasonal Trash
				"egg0", "egg1", "egg2", "egg3", "egg4", "egg5", 
				"egg6", "egg7", "egg8", "", "", "", 
				"redenvelopev1", "redenvelopev2", "redenvelopev3", "", "", "", 
				"ornament", "mistletoe", "candycane", "merry", "", "",
				 "", "", "", "", "", "", "", "", "", "", "", "",
				 "", "", "", "", "", "", "", "", "", "", "", "",
				"x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8"];
//Potion Thresholds
let hPotSmall = 50;
let hPotBig = 20;
let mPotSmall = 600;
let mPotBig = 45;

//Selling parameters
let sellItemLevel = 3;
let profitMargin = 10;

function merchantSkills(){
	
	//Functions only used on "main" map
	if(character.map === "main"
	  && Math.abs(character.x) < 500
	  && Math.abs(character.y) < 500){

		//if(new Date().getSeconds() === 30){
		if(findTriple(0)) compoundItems(0);
		if(findTriple(1)) compoundItems(1);
		if(findTriple(2)) compoundItems(2);
		if(findTriple(3)) compoundItems(3);
		//searchItems2bSold Returns Array SLOTS. Therefor it can return ZEROES
		//So we have to specifically look for UNDEFINED
		if(searchItems2bSold(sellItemLevel) !== undefined
		  && findEmptyTradeSlots() !== undefined) sellItems(sellItemLevel, profitMargin);
		selLTrash();
		buyCheapStuff();
	}
	
	//Check if party is incomplete
	restoreParty();
	//Buff players with merchant's luck
	merchantsLuck();
	
	/*
	if (new Date().getMinutes() === 00
		|| new Date().getMinutes() === 15
		|| new Date().getMinutes() === 30
	   	|| new Date().getMinutes() === 45
	   	|| new Date().getMinutes() === 48){
	*/
	
	if(new Date().getMinutes() % 10 === 0){
		
		updateFarmingSpot();

		//Close merchant Stand
		//parent.socket.emit("merchant", {close:1})
		parent.close_merchant(41);
		
		//Make the big round
		smart_move({to:"main"}, () => {
			//Buy Potions
			buyPotions();
			relocateItems();
			smart_move({to:farmMap}, () => {
				smart_move({x: farmCoord.x, y: farmCoord.y}, () => {
					tranferPotions();
					merchantsLuck();
					//Buy Scrolls
					smart_move({to:"scrolls"}, () => {
						buyScrolls();
						//Exchange gems
						smart_move({to:"exchange"}, () => {
							exchangeGems();
							//Deposit Money
							smart_move({to:"bank"}, () => {
								depositMoney();
								depositItems();
								//Go to the market and sell things
								openMerchantStand();
							});
						});
					});
				});
			});
		});
	}
}

function buyPotions(){
	let	hPotions0 = quantity("hpot0");
	let	hPotions1 = quantity("hpot1");
	let mPotions0 = quantity("mpot0");
	let mPotions1 = quantity("mpot1");
	if(hPotions0 < hPotSmall )buy_with_gold("hpot0", hPotSmall - hPotions0);
	if(hPotions1 < hPotBig )buy_with_gold("hpot1", hPotBig - hPotions1);
	if(mPotions0 < mPotSmall) buy_with_gold("mpot0", mPotSmall - mPotions0);
	if(mPotions1 < mPotBig) buy_with_gold("mpot1", mPotBig - mPotions1);
	log("Bought Potions!");
}

function tranferPotions(){

	let potions = ["hpot0", "mpot0", "hpot1", "mpot1"];

	//parent.party_list is an array with the names of PartyMembers
	//We iterate over it
	parent.party_list.forEach((otherPlayerName) => { 
		// !!! IMPORTANT !!! parent.entities only holds OTHER players, not
		//the current player running this code!! Therefor....
		let partyMember = parent.entities[otherPlayerName];
		//...we have to check if party member holds something or is undefined!!!
		if (partyMember) {
			for(let i = 0; i < potions.length; i++){
				if(locate_item(potions[i]) !== -1) send_item(partyMember,locate_item(potions[i]),Math.floor(quantity(potions[i]) / 3));
			}
			log("Delivered Potions!");
		}
	});
}

function buyScrolls(){
	let compScrolls = ["cscroll0", "cscroll1"];
	compScrolls.forEach(scroll => {
		if(quantity(scroll) < minCompoundScrolls){
			buy(scroll, minCompoundScrolls - quantity(scroll));
			log("Bought Scrolls!");
		}
	})
}

//Sell trash, keep if it's high grade. (Grades: 0 Normal / 1 High /  2 Rare
function selLTrash(){
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		   && trashName.indexOf(character.items[i].name) !== -1
		   && item_grade(character.items[i]) !== 2) {
			log("Merchant is unloading trash: " + character.items[i].name);
			if(character.items[i].q){
				sell(i, character.items[i].q);
			}else{
				sell(i, character.items[i]);
			}
		}
	}		
}

function exchangeGems(){
	for(let i = 0; i <= 41; i++){
		let exchangeables = ["gem","box","5bucks","gift0","gift1","ornament","troll","mistletoe","basketofeggs","redenvelope","redenvelopev2","redenvelopev3","gem1","candycane","candy1","goldenegg","bugbountybox","armorbox","gem0","candy0","weaponbox","xbox","mysterybox","",""]
		if(character.items[i]
		  && exchangeables.indexOf(G.items[character.items[i].name].type) !== -1){
			exchange(i);
			log("Item Exchanged!");
		}
	}
}

function depositMoney(){	
	bank_deposit(character.gold - reserveMoney);
	log("Money deposited! Money in Pocket: " + character.gold);
}

function depositItems(){
	for(let i = 0; i <= 34; i++){
		if(character.items[i]
		  && (character.items[i].level
		  && character.items[i].level > sellItemLevel)
		  || item_grade(character.items[i]) > 1){
		 	bank_store(i);
			log("Item Stored in bank!");
		}
	}
}

function compoundItems(level){
	let triple = findTriple(level);
	if(triple
	   && triple.length === 3
	   && !character.q.compound){
		if(level < 2){
			compound(triple[0],triple[1],triple[2],locate_item("cscroll0"));
			log("Compounded a level " + level + "  Item!");
		}else if(level >= 2){
			compound(triple[0],triple[1],triple[2],locate_item("cscroll1"));
			log("Compounded a level " + level + "  Item!");
		}
	}
}

function findTriple(level){
	let compoundTriple = [];
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		   	&& character.items[i].level === level
		   	//Weapons can't be compounded. If item has attack attr, no compound
		 	&& !G.items[character.items[i].name].attack){
			for(let j = i + 1; j <= 41; j++){
				if(character.items[j]
				   && character.items[j].name === character.items[i].name
				   && character.items[j].level === level){
					for(let k = j + 1; k <= 41; k++){
						if(character.items[k]
						   && character.items[k].name === character.items[j].name
						   && character.items[k].level === level){
							log(" Slot i: "  + i + " item: " + character.items[i].name + " Slot j: "  + j + " item: " + character.items[j].name + " Slot k: "  + k + " item: " + character.items[k].name )
							compoundTriple.push(i, j, k);
							return compoundTriple
						}
					}
				}
			}
		}
	}
}

function searchItems2bSold(sellItemLevel = 2){
	for (let i = 0; i <= 34; i++){
		if(character.items[i]
		   && character.items[i].level === sellItemLevel) return i;
	}
}

function sellItems(sellItemLevel = 2, profitMargin = 2){
	trade(searchItems2bSold(sellItemLevel), findEmptyTradeSlots(),  item_value(character.items[searchItems2bSold(sellItemLevel)]) * profitMargin);
}

function findEmptyTradeSlots(){
	let tradeSlots = Object.keys(character.slots).filter(tradeSlot => tradeSlot.includes("trade"));

	//Returns i + 1 because character.slots is 0-indexed,
	//but Trate-Slots start with 1 NOT ZERO
	for (let i = 0; i < tradeSlots.length; i++){
		if(!character.slots[tradeSlots[i]]) return i + 1;
	}
}

function merchantsLuck(){
	for (i in parent.entities){
		if(parent.entities[i].player
		  && parent.entities[i].ctype
		  && !parent.entities[i].npc
		  //&& !parent.entities[i].s.mluck
		  && (parent.entities[i].s.mluck.f != character.name
			 || !parent.entities[i].s.mluck.f)
		  && character.mp > (character.max_mp / 10)
		  && character.mp > G.skills.mluck.mp
		  && distance(character, parent.entities[i]) < G.skills.mluck.range
		  && can_use("mluck")){
			use_skill("mluck", parent.entities[i].name);
			log("Buffing: " + parent.entities[i].name);
		}
	}
}

function buyCheapStuff(){
	for (i in parent.entities){
		let otherPlayer = parent.entities[i];
		if(otherPlayer.player
		  && otherPlayer.ctype === "merchant"
		  && otherPlayer.slots
		  && distance(character, otherPlayer) < G.skills.mluck.range){

			let tradeSlots = Object.keys(otherPlayer.slots).filter(tradeSlot => tradeSlot.includes("trade"));
			tradeSlots.forEach(tradeSlot => {
				if(otherPlayer.slots[tradeSlot]
				   && otherPlayer.slots[tradeSlot].price < item_value(otherPlayer.slots[tradeSlot])
				   && character.gold > otherPlayer.slots[tradeSlot].price){
					trade_buy(otherPlayer, tradeSlot);
					log("Bought " + otherPlayer.slots[tradeSlot].name + " from player: " + otherPlayer.name)
				}				
			});				  
		}
	}
}

function restoreParty(){
	if(parent.party_list.length < 4){
		loadCharacters();
		log("Merchant restoring party.");
		parent.close_merchant(41);
		updateFarmingSpot();
		smart_move({to:farmMap}, () => {
			let farmCoord = getFarmingSpot(farmMonsterType, "coord");
			if(parent.party_list.length < 4){
				smart_move({x:farmCoord.x, y:farmCoord.y}, () => {
					for(let i = 0; i <= 3000; i += 500) initParty();
					if(parent.party_list.length === 4) log("Merchant has restored party.");
					openMerchantStand();
				});
			}
		});
	}
}

function openMerchantStand(){
//Go to the market and sell things
	if(character.map != "main"){
		smart_move({to:"main"}, () => {
			smart_move({to:"town"}, () => {
				smart_move({x: character.x  + 45, y: character.y - 70}, () => {
					//parent.socket.emit("merchant",{num:41});
					parent.open_merchant(41);
				});
			});
		});
	}else{
		smart_move({to:"town"}, () => {
			smart_move({x: character.x  + 45, y: character.y - 70}, () => {
				//parent.socket.emit("merchant",{num:41});
				parent.open_merchant(41);
			});
		});
	}
}