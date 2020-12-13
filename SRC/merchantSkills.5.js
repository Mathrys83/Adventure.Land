const reserveMoney = 500000;
const minCompoundScrolls = 100;

//Potion Thresholds
const potions = {
	hpot0: 30,
	hpot1: 15,
	mpot0: 120,
	mpot1: 15
};
//Cost 4800

//Selling parameters
const sellItemLevel = 3;
const profitMargin = 20;

//Item levels to be compounded
const compoundLevels = [0, 1];

const trashName = ["cclaw", "crabclaw", "shoes1", "coat1", "pants1",
	"wshoes", "", "spores", "beewings", "wcap", "", //bfur ink
	"strearring", "stramulet", "wattire", "poison", "rattail",
	"wbreeches", "gslime", "", "", "shoes", "", //ascale cscale lotusf
	"pants", "spear", "spidersilk", "sstinger", "", //snakefang
	"smush", "spores", "frogt", "gloves1", "stinger", "wgloves",
	"snakeoil", "dstones", "helmet1", "bwing",
	"tshirt0", "tshirt1", "tshirt2", "cshell", "whiteegg",
	"quiver", "hbow", "shield", "mushroomstaff", "", "", "", "", //quiver
	"stramulet", "strbelt", "strearring", "", "", //"strring"
	"hpbelt", "ringsj", "hpamulet", "", "", "", "", "", // ringsj hpamulet hpbelt
	"throwingstars", "smoke", "phelmet", "", "", "", "", "",
	//XMas Set
	"xmashat", "mittens", "xmaspants", "xmasshoes", "rednose", "warmscarf", "gcape", "ornamentstaff",
	"slimestaff", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "",
	//Unneeded elixirs
	"elixirstr0", "elixirstr1", "elixirstr2",
	"", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "",
	//Seasonal Trash
	/*
	"egg0", "egg1", "egg2", "egg3", "egg4", "egg5",
	"egg6", "egg7", "egg8", "", "", "",
	"redenvelopev1", "redenvelopev2", "redenvelopev3", "", "", "",
	"ornament", "mistletoe", "candycane", "merry", "", "",
	"", "", "", "", "", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "", "", "", "", "",
	"x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8"
	*/
	"", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", "",
	"", "", "", "", "", "", "", ""];

function merchantSkills() {

	//Functions only used on "main" map
	if (character.map === "main"
		&& Math.abs(character.x) < 500
		&& Math.abs(character.y) < 500) {

		//Sell unwanted items
		sellTrash();
		//Buy cheap items from other merchants
		buyCheapStuff();

		//Compound items
		for (const level of compoundLevels) if (findTriple(level)) compoundItems(level);

		//searchItems2bSold Returns Array SLOTS. Therefor it can return ZEROES
		//So we have to specifically look for UNDEFINED
		if (searchItems2bSold(sellItemLevel) !== undefined
			&& findEmptyTradeSlots() !== undefined) sellItems(sellItemLevel, profitMargin);
	}

	//Check if party is incomplete, restore of not
	restoreParty();
	//Buff players with merchant's luck
	merchantsLuck();
	//Exchange Gems and Quests
	exchangeGemsQuests();
	//Craft items
	craftItems();

	//Visit farm-party every 10 minutes.
	//Bring potions, take their gold and items
	//Store gold and good items in bank
	if (new Date().getMinutes() % 10 === 0) {

		updateFarmingSpot();
		closeMerchantStand();

		//Make the big round
		smart_move({ to: "main" }, () => {
			buyPotions();
			relocateItems();
			smart_move(farmingSpotData, () => {
				tranferPotions();
				merchantsLuck();
				smart_move({ to: "bank" }, () => {
					depositGold();
					depositItems();
					if (buyScrolls("check")) {
						smart_move({ to: "scrolls" }, () => {
							buyScrolls("buy");
							openMerchantStand();
						});
					} else {
						openMerchantStand();
					}
				});
			});
		});
	}
}

//Buy potions
function buyPotions() {
	//If farmMonsterType requires a master, buy more potions!	
	const potionModifier = requiresMaster.includes(farmMonsterType) ? 5 : 1;
	for (const potion in potions) {
		if (quantity(potion) < potions[potion]) buy_with_gold(potion, (potions[potion] - quantity(potion)) * potionModifier);
	}
}

//Transfer potions to characters
function tranferPotions() {
	//All potions not listed here get sold (Check "trashName"-Array)
	const essentialPotions = ["hpot0", "mpot0", "hpot1", "mpot1"];
	const dexPotions = ["elixirdex0", "elixirdex1", "elixirdex2"];
	const intPotions = ["elixirint0", "elixirint1", "elixirint2"];
	const luckPotions = ["elixirluck"];

	for (const name of parent.party_list) {
		const partyMember = get_player(name);
		if (partyMember) {

			//Deliver essential potions (Health & Mana)
			essentialPotions.forEach(potion => {
				if (locate_item(potion) !== -1) send_item(partyMember, locate_item(potion), Math.floor(quantity(potion) / 3));
				log("Delivered Potions!");
			});
			//Deliver luck potions
			luckPotions.forEach(potion => {
				if (locate_item(potion) !== -1) send_item(partyMember, locate_item(potion), Math.floor(quantity(potion) / 3));
				log("Delivered Luck Potions!");
			});
			//Deliver dexterity potions to ranger
			if (partyMember.ctype === "ranger") {
				dexPotions.forEach(potion => {
					if (locate_item(potion) !== -1) send_item(partyMember, locate_item(potion), quantity(potion));
					log("Delivered DexPotions!");
				});
			}
			//Deliver intelligence potions to Priest & Mage
			if (partyMember.ctype === "priest" || partyMember.ctype === "mage") {
				intPotions.forEach(potion => {
					if (locate_item(potion) !== -1 && quantity(potion) % 2 === 0) send_item(partyMember, locate_item(potion), quantity(potion) / 2);
					if (quantity(potion) % 2 !== 0 && Math.round(Math.random()) === 1) send_item(partyMember, locate_item(potion), 1);
					log("Delivered intPotions!");
				});
			}
		}
	}
}

//Buy Compound Scrolls
function buyScrolls(action) {
	let compScrolls = ["cscroll0", "cscroll1"];
	for (const scroll of compScrolls) {
		let missingScrolls = minCompoundScrolls - quantity(scroll);
		let affordableScrolls = Math.floor(character.gold / G.items[scroll].g);
		let scrollNum = (missingScrolls <= affordableScrolls) ? missingScrolls : affordableScrolls;
		if (action === "check") {
			return scrollNum > 0 ? true : false;
		}
		else if (action === "buy"
			&& scrollNum
			&& scrollNum > 0) {
			buy(scroll, scrollNum);
			log(`Bought ${scrollNum} ${G.items[scroll].name}`);
		}
	}
}

/*
// ### Works indepentend of the "Big round" ###

//Buy Compound Scrolls
function buyScrolls() {
	let compScrolls = ["cscroll0", "cscroll1"];
	for (const scroll of compScrolls) {
		let missingScrolls = minCompoundScrolls - quantity(scroll);
		let affordableScrolls = Math.floor(character.gold / G.items[scroll].g);
		let scrollNum = (missingScrolls <= affordableScrolls) ? missingScrolls : affordableScrolls;
		if (scrollNum) {
			getScrolls(scroll, scrollNum);
			return;
		}
	}

	function getScrolls(scroll, scrollNum) {
		closeMerchantStand();
		smart_move(find_npc("scrolls"), () => {
			buy(scroll, scrollNum);
			log(`Bought ${scrollNum} ${G.items[scroll].name}`);
			setTimeout(() => {
				openMerchantStand();
			}, 8000);
		});
		return;
	}
}
*/

//Sell trash, keep if it's high grade. (Grades: 0 Normal / 1 High /  2 Rare
function sellTrash() {
	character.items.forEach((item, index) => {
		if (item
			&& trashName.includes(item.name)
			&& item_grade(item) < 2) {
			log(`Merchant is unloading trash ${item.name}`);
			item.q ? sell(index, item.q) : sell(index, item);
		}
	});
}

//Deposit Gold in bank
function depositGold() {
	bank_deposit(character.gold - reserveMoney);
	log(`Money deposited! Money in Pocket: ${character.gold}`);
}

//Deposit items in bank
function depositItems() {
	character.items.forEach((item, index) => {
		if (item
			&& (item.level
				&& item.level > sellItemLevel)
			|| item_grade(item) === 2) {
			bank_store(index);
			log("Item Stored in bank!");
		}
	});
}

//Compound items
function compoundItems(level) {
	let triple = findTriple(level);
	if (triple
		&& triple.length === 3
		&& !character.q.compound) {

		compound(triple[0], triple[1], triple[2], locate_item(chooseScroll(triple))).then((data) => {
			(data.success) ? game_log(`Compounded level ${data.level} accessory!`) : game_log("Compound Failed - Item lost!");
		}).catch((data) => {
			game_log(`Compound Failed: ${data.reason}`);
		});
	}
	//Grade the item and choose a scroll accordingly
	function chooseScroll(triple) {
		if (item_grade(character.items[triple[0]]) === 0) return "cscroll0";
		if (item_grade(character.items[triple[0]]) === 1) return "cscroll1";
		if (item_grade(character.items[triple[0]]) === 2) return "cscroll2";
	}
}

//Find a triple of items (same item, same level) 
function findTriple(level) {
	let compoundTriple = [];
	//Look for triples
	for (let i = 0; i <= 41; i++) {
		if (character.items[i]
			&& character.items[i].level === level
			//First loop selects a compoundable item so the two 
			// nested loops only need to match item name & item level
			&& G.items[character.items[i].name].compound
			//Validate Compound: If  item is needed for crafting,
			//it must NOT be compounded (Craft only takes lvl 0 items!)
			&& validateCompound(character.items[i].name)) {
			for (let j = i + 1; j <= 41; j++) {
				if (character.items[j]
					&& character.items[j].name === character.items[i].name
					&& character.items[j].level === level) {
					for (let k = j + 1; k <= 41; k++) {
						if (character.items[k]
							&& character.items[k].name === character.items[j].name
							&& character.items[k].level === level) {
							log(`Slot i: ${i} item: ${character.items[i].name} Slot j: ${j} item: ${character.items[j].name} Slot k: ${k} item: ${character.items[k].name}`)
							compoundTriple.push(i, j, k);
							return compoundTriple
						}
					}
				}
			}
		}
	}

	//Validate Compound: If  item is needed for crafting,
	//it must NOT be compounded (Craft only takes lvl 0 items!)
	function validateCompound(compoundItem) {
		for (const craftItem of itemsToCraft) {
			const { items: ingredients } = G.craft[craftItem];
			for (const ingredient of ingredients) {
				if (compoundItem === ingredient[1]) return false;
			}
		}
		return true;
	}
}

//Find items to be sold  in the merchant stand
function searchItems2bSold(sellItemLevel = 3) {
	for (const slot in character.items) {
		if (character.items[slot]
			&& !itemsToCraft.includes(character.items[slot].name)
			&& character.items[slot].level === sellItemLevel) return slot;
	}
}

//Sell items that match a certain level, with a profit
function sellItems(sellItemLevel = 2, profitMargin = 15) {
	trade(searchItems2bSold(sellItemLevel), findEmptyTradeSlots(), item_value(character.items[searchItems2bSold(sellItemLevel)]) * profitMargin);
}

//Find empty trade-slots to put goods in
function findEmptyTradeSlots() {
	let tradeSlots = Object.keys(character.slots).filter(tradeSlot => tradeSlot.includes("trade"));
	//Returns slot + 1 because character.slots is 0-indexed,
	//but Trate-Slots start with 1 NOT ZERO!
	for (const slot in tradeSlots) {
		if (!character.slots[tradeSlots[slot]]) return Number(slot) + 1;
	}
}

//Auto-buy items from other merchants if they are sold below their value
//Also, auto-join Giveaways
function buyCheapStuff() {
	for (const i in parent.entities) {
		let otherPlayer = parent.entities[i];
		if (otherPlayer.player
			&& otherPlayer.ctype === "merchant"
			&& otherPlayer.slots
			&& distance(character, otherPlayer) < G.skills.mluck.range) {

			let tradeSlots = Object.keys(otherPlayer.slots).filter(tradeSlot => tradeSlot.includes("trade"));
			tradeSlots.forEach(tradeSlot => {
				let otherPlayerTradeSlot = otherPlayer.slots[tradeSlot];
				if (otherPlayerTradeSlot
					&& !otherPlayerTradeSlot.b //Excludes "whishlisted" items! Trade slots can "sell" or "wishlist"!
					&& otherPlayerTradeSlot.price < item_value(otherPlayerTradeSlot)
					&& character.gold > otherPlayerTradeSlot.price) {
					//Don't try to buy Giveaways
					if (!otherPlayerTradeSlot.giveaway) {
						//If it's a single item, buy it.
						if (!otherPlayerTradeSlot.q) {
							log(`Buying 1 from ${otherPlayer} Slot ${tradeSlot}`)
							trade_buy(otherPlayer, otherPlayerTradeSlot);
							//If there the item has a quantity, buy as many as possible
						} else if (otherPlayerTradeSlot.q) {
							let maxBuy = Math.floor(character.gold / otherPlayerTradeSlot.price);
							parent.trade_buy(tradeSlot, otherPlayer.name, otherPlayerTradeSlot.rid, maxBuy);
						}
						//Auto-Join Giveaways
					} else if (otherPlayerTradeSlot.giveaway
						&& !otherPlayerTradeSlot.list.includes(character.name)) {
						parent.socket.emit('join_giveaway', {
							slot: tradeSlot,
							id: otherPlayer.id,
							rid: otherPlayerTradeSlot.rid,
						});
						log("Joined giveaway!");
					}
				}
			});
		}
	}
}

//Buff other characters with Merchants Luck!
function merchantsLuck() {
	let otherPlayers = [];
	for (i in parent.entities) {
		if (parent.entities[i].player
			&& parent.entities[i].ctype
			&& !parent.entities[i].rip
			&& !parent.entities[i].npc
			&& (!parent.entities[i].s.mluck
				|| parent.entities[i].s.mluck.strong === false)
			/*
			&& (!parent.entities[i].s.mluck
			 || !parent.entities[i].s.mluck.f
			 || parent.entities[i].s.mluck.f != character.name)
			*/
			&& character.mp > (character.max_mp / 10)
			&& character.mp > G.skills.mluck.mp
			&& distance(character, parent.entities[i]) < G.skills.mluck.range
			&& is_in_range(parent.entities[i], "mluck")
			&& !is_on_cooldown("mluck")) {
			//All eligible players get pushed to the array...
			otherPlayers.push(parent.entities[i]);
		}
	}
	//...and then one random player is picked!
	if (otherPlayers.length > 0) {
		let luckyPlayer = Math.floor(Math.random() * otherPlayers.length)
		use_skill("mluck", otherPlayers[luckyPlayer].name);
		log(`Giving luck to: ${otherPlayers[luckyPlayer].name}`);
	}
}

//If a character is not in the party, reatore it
function restoreParty() {
	if (parent.party_list.length < 4) {
		loadCharacters();
		initParty();
	}
}

//Close the merchant stand
function closeMerchantStand() {
	//Close merchant Stand
	//parent.socket.emit("merchant", {close:1})
	parent.close_merchant(locate_item("stand0"));
}

//Go to the market and sell things
function openMerchantStand() {
	if (character.map !== "main") {
		smart_move({ to: "main" }, () => {
			goTownOpenStand();
		});
	} else {
		goTownOpenStand();
	}
	//Separate function, to shorten above code
	function goTownOpenStand() {
		smart_move({ to: "town" }, () => {
			smart_move({ x: -20 - Math.round(Math.random() * 180), y: character.y - 85 }, () => {
				//Turn around, face front
				smart_move({ x: character.x, y: character.y + 1 }, () => {
					//parent.socket.emit("merchant",{num:41});
					parent.open_merchant(locate_item("stand0"));
				});
			});
		});
	}
}

//Exchange Gems & Quests at the corresponding NPC
function exchangeGemsQuests() {
	if (locateGems("findGems")) {
		closeMerchantStand();
		//smart_move({ to: "exchange" }, () => {
		smart_move(find_npc(locateGems("findNpc")), () => {
			exchange(locateGems("getSlotNum"));
			log("Item Exchanged!");
			setTimeout(() => {
				if (!locateGems("findGems")) openMerchantStand();
			}, 8000);
		});
	}
	//Finds Gems & Quests in Inventory
	function locateGems(arg) {
		for (const slotNum in character.items) {
			if (character.items[slotNum]) {
				const item = G.items[character.items[slotNum].name];
				//If the item is a gem, exchange it
				if ((item.type === "gem"
					|| item.type === "box"
					|| item.type === "misc"
					|| item.type === "quest")
					//"e"-key means the item is exchangeable
					&& item.e
					//Some quests (seashells, ornaments) need more than 1 item to be exchangeable
					&& item.e <= character.items[slotNum].q) {
					//Gem found
					if (arg === "findGems") {
						return true;
						//Return slot
					} else if (arg === "getSlotNum") {
						return slotNum;
						//Go to the correct NPC
					} else if (arg === "findNpc") {
						//If the item is a gem (not a quest), go to Xyn
						if (!item.quest) {
							return "exchange";
							//If the item is  a quest, go to the corresponding NPC
						} else if (item.quest) {
							for (const npc in G.npcs) {
								if (G.npcs[npc].quest === item.quest) return npc;
							}
						}
					}
				}
			}
		}
	}
}

//Craft Items
function craftItems() {
	for (const item of itemsToCraft) {
		if (checkCraftIngredients(item)) {
			closeMerchantStand();
			smart_move(find_npc("craftsman"), () => {
				auto_craft(item);
				setTimeout(() => {
					if (!checkCraftIngredients(item)) openMerchantStand();
				}, 8000);
			});
			return;
		}
	}
	//Checks inventory if all needed ingredients are available
	function checkCraftIngredients(item) {
		let ingredientsComplete = [];
		const { items: ingredients } = G.craft[item];
		if (G.craft[item].cost <= character.gold) {
			for (const ingredient of ingredients) {
				if (locate_item(ingredient[1]) !== -1
					//Check that item has no level...
					&& (!character.items[locate_item(ingredient[1])].level
						//... if it has a level, level must be 0 for the item to be crafted
						|| character.items[locate_item(ingredient[1])].level === 0)) {
					//Check if exactly 1 of this ingredient is needed
					if (ingredient[0] === 1) {
						ingredientsComplete.push(true);
						//If more than 1 of this ingredient is needed, check if the inventory holds enough
					} else if (ingredient[0] > 1
						&& (quantity(ingredient[1]) >= ingredient[0])) {
						//&& (character.items[locate_item(ingredient[1])].q >= ingredient[0])) {
						ingredientsComplete.push(true);
					}
				}
			}
		}
		return ingredients.length === ingredientsComplete.length ? true : false;
	}
}