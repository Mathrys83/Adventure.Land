const reserveMoney = 1000000;
const minScrolls = 100;

//Potion Thresholds
const potions = {
	hpot0: 30,
	hpot1: 15,
	mpot0: 150,
	mpot1: 15
};
//Cost 19800

//Selling parameters
const sellItemLevel = 3;
const profitMargin = 20;

//Max level to be compounded
const maxCompoundLevel = 3;
//Max level to be upgraded
const maxUpgradeLevel = 5;

const trashName = [
	// ringsj hpamulet hpbelt strring quiver snakeoil snakefang
	//spidersilk ascale cscale lotusf bfur ink spores
	"cclaw", "crabclaw", "shoes1", "coat", "coat1", "pants1",
	"wshoes", "beewings", "wcap", "strearring", "stramulet",
	"wattire", "poison", "rattail", "wbreeches", "gslime",
	"shoes", "pants", "spear", "sstinger", "smush", "frogt",
	"gloves", "gloves1", "stinger", "wgloves", "sword",
	"dstones", "helmet", "helmet1", "bwing", "tshirt0",
	"tshirt1", "tshirt2", "cshell", "whiteegg", "quiver",
	"hbow", "shield", "mushroomstaff", "swifty", "stramulet",
	"strbelt", "strearring", "hpbelt", "hpamulet",
	"throwingstars", "smoke", "phelmet", "basher",
	"xmace", "dagger", "", "", "",
	"", "", "", "", "", "", "", "",
	//XMas Set
	"xmashat", "mittens", "xmaspants", "xmasshoes", "rednose", "warmscarf", "gcape", "ornamentstaff",
	"", "", "", "", "", "", "", "",
	//Unneeded elixirs
	"elixirstr0", "elixirstr1", "elixirstr2",
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

		//Upgrade items
		upgradeItems();

		//Compound items
		for (let i = 0; i < maxCompoundLevel; i++) if (findTriple(i)) compoundItems(i);

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

	//Dismantle items
	dismantleItems();

	//Visit farm-party every 10 minutes.
	//Bring potions, take their gold and items
	//Store gold and good items in bank
	if (new Date().getMinutes() % 10 === 0) {

		updateFarmingSpot();
		close_stand();

		//Make the big round
		smart_move({ to: "main" }, () => {
			buyPotions();
			relocateItems();
			smart_move(farmingSpotData, () => {
				tranferPotions();
				merchantsLuck();
				smart_move({ to: "bank" }, () => {
					depositGold();
					//depositValuableItems();
					depositSelectedItems();
					//Wait after depositing items.
					//Depositing multiple items and immediately smart_moving can result in a kick (Call-cost too high)
					setTimeout(() => {
						if (buyScrolls("check")) {
							smart_move({ to: "scrolls" }, () => {
								buyScrolls("buy");
								openMerchantStand();
							});
						} else {
							openMerchantStand();
						}
					}, 2000);
				});
			});
		});
	}
}

//Buy potions
function buyPotions() {
	//If farmMonsterType requires a master, buy more potions!	
	const potionModifier = requiresMaster.includes(farmMonsterType) ? 3 : 1;
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
				if (locate_item(potion) !== -1) {
					send_item(partyMember, locate_item(potion), Math.floor(quantity(potion) / 3));
					log("Delivered essential Potions!");
				}
			});
			//Deliver luck potions
			luckPotions.forEach(potion => {
				if (locate_item(potion) !== -1) {
					send_item(partyMember, locate_item(potion), Math.floor(quantity(potion) / 3));
					log("Delivered Luck Potions!");
				}
			});
			//Deliver dexterity potions to ranger
			if (partyMember.ctype === "ranger") {
				dexPotions.forEach(potion => {
					if (locate_item(potion) !== -1) {
						send_item(partyMember, locate_item(potion), quantity(potion));
						log("Delivered DexPotions!");
					}
				});
			}
			//Deliver intelligence potions to Priest & Mage
			if (partyMember.ctype === "priest" || partyMember.ctype === "mage") {
				intPotions.forEach(potion => {
					if (locate_item(potion) !== -1 && quantity(potion) % 2 === 0) {
						send_item(partyMember, locate_item(potion), quantity(potion) / 2);
						log("Delivered intPotions!");
					}
					if (quantity(potion) % 2 !== 0 && Math.round(Math.random()) === 1) {
						send_item(partyMember, locate_item(potion), 1);
						log("Delivered intPotions!");
					}
				});
			}
		}
	}
}

//Buy Scrolls
function buyScrolls(action) {
	let scrolls = ["scroll0", "scroll1", "cscroll0", "cscroll1"];
	for (const scroll of scrolls) {
		let missingScrolls = minScrolls - quantity(scroll);
		let affordableScrolls = Math.floor(character.gold / G.items[scroll].g);
		let scrollNum = (missingScrolls <= affordableScrolls) ? missingScrolls : affordableScrolls;
		if (action === "check") {
			if (scrollNum > 0) return true;
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
// ### Works independent of the "Big round" ###

//Buy Compound Scrolls
function buyScrolls() {
	let compScrolls = ["cscroll0", "cscroll1"];
	for (const scroll of compScrolls) {
		let missingScrolls = minScrolls - quantity(scroll);
		let affordableScrolls = Math.floor(character.gold / G.items[scroll].g);
		let scrollNum = (missingScrolls <= affordableScrolls) ? missingScrolls : affordableScrolls;
		if (scrollNum) {
			getScrolls(scroll, scrollNum);
			return;
		}
	}

	function getScrolls(scroll, scrollNum) {
		close_stand();
		smart_move(find_npc("scrolls"), () => {
			buy(scroll, scrollNum);
			log(`Bought ${scrollNum} ${G.items[scroll].name}`);
			setTimeout(() => {
				openMerchantStand();
			}, 6000);
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

/*
//Deposit items in bank
function depositValuableItems() {
	character.items.forEach((item, index) => {
		if (item
			&& (item.level
				&& item.level > sellItemLevel)
			|| item_grade(item) === 2) {
			bank_store(index);
			log("Item stored in bank!");
		}
	});
}
*/

//Collects similar items in the bank
//First item has to be stored manually to initialize!
//This is a precaution not to store unwanted items (Overflow bank)
function depositSelectedItems() {
	//Loops through bank-sections
	for (const box in character.bank) {
		if (box === "gold") continue;
		//Loops through individual bank-slots
		for (let slot of character.bank[box]) {
			if (slot !== null) {
				//Loops through character's inventory
				character.items.forEach((item, index) => {
					if (item !== null
						&& (item_grade(item) === 2
							|| (item.level
								&& item.level > sellItemLevel)
							|| (slot.name === item.name
								&& (slot.q
									|| slot.level <= item.level)))) {
						bank_store(index);
						log(`Stored ${item.name} in bank!`);
					}
				});
			}
		}
	}
}

//Upgrade Items
function upgradeItems() {
	const scrolls = ["scroll0", "scroll1", "scroll2"];
	for (slot in character.items) {
		if (!character.q.upgrade
			&& character.items[slot]
			&& (character.items[slot].name
				&& itemsToUpgrade.indexOf(character.items[slot].name) !== -1
				&& G.items[character.items[slot].name].upgrade)
			&& character.items[slot].level <= maxUpgradeLevel) {
			//Use massproduction skill
			massProduction();
			//Upgrade item
			upgrade(slot, locate_item(scrolls[item_grade(character.items[slot])])).then(
				(data) => {
					game_log(`Upgraded ${character.items[slot].name}`);
				},
				(data) => {
					game_log(`Upgrade failed: ${character.items[slot].name} : ${data.reason}`);
				},
			);
			return;
		}
	}
}

//Compound items
function compoundItems(level) {
	const scrolls = ["cscroll0", "cscroll1", "cscroll2"];
	let triple = findTriple(level);
	if (triple
		&& triple.length === 3
		&& !character.q.compound) {
		//Use massproduction skill
		massProduction();
		//Compound item
		compound(triple[0], triple[1], triple[2], locate_item(scrolls[item_grade(character.items[triple[0]])])).then((data) => {
			(data.success) ? game_log(`Compounded level ${data.level} accessory!`) : game_log("Compound Failed - Item lost!");
		}).catch((data) => {
			game_log(`Compound Failed: ${data.reason}`);
		});
	}
}

/*
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
	function chooseScroll(triple) {
		const scrolls = ["cscroll0", "cscroll1", "cscroll2"];
		return scrolls[item_grade(character.items[triple[0]])];
	}
}
*/

//Mass Production
function massProduction() {
	if (character.level >= 60
		&& character.mp > G.skills.massproductionpp.mp
		&& !is_on_cooldown("massproductionpp")) {
		use_skill("massproductionpp");
		game_log("Used Mass Production 90%");
	} else if (character.level >= 30
		&& character.mp > G.skills.massproduction.mp
		&& !is_on_cooldown("massproduction")) {
		use_skill("massproduction");
		game_log("Used Mass Production 50%");
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
				//Must be a Trade-Slot
				if (otherPlayerTradeSlot) {
					if (!otherPlayerTradeSlot.b //Excludes "whishlisted" items! Trade slots can "sell" or "wishlist"!
						&& otherPlayerTradeSlot.price < item_value(otherPlayerTradeSlot)
						&& character.gold > otherPlayerTradeSlot.price
						//Don't try to buy Giveaways
						&& !otherPlayerTradeSlot.giveaway) {
						//If it's a single item, buy it.
						if (!otherPlayerTradeSlot.q) {
							log(`Buying 1 from ${otherPlayer} Slot ${tradeSlot}`)
							trade_buy(otherPlayer, tradeSlot, 1);
							//If the item has a quantity, buy as many as possible
						} else if (otherPlayerTradeSlot.q) {
							//Maximum possible quantity of items that can be bought wit available gold
							let maxBuy = Math.floor(character.gold / otherPlayerTradeSlot.price) < otherPlayerTradeSlot.q ? Math.floor(character.gold / otherPlayerTradeSlot.price) : otherPlayerTradeSlot.q;
							trade_buy(otherPlayer, tradeSlot, maxBuy);
							//parent.trade_buy(tradeSlot, otherPlayer.name, otherPlayerTradeSlot.rid, maxBuy);
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

//Go to the market and sell things
function openMerchantStand() {
	/*
	IMPORTANT!!! Because this function gets called with a setTimeout(),
	it can be called WHILE the character is moving,
	causing too many calls to the server, resulting in a kick!
	We therefor MUST check in the beginning if the character is already moving!
	*/
	if (is_moving(character)) return;

	smart_move({
		map: "main",
		x: - 20 - Math.round(Math.random() * 180),
		y: - 70
	}, () => {
		//Face front
		move(character.x, character.y + 1);
		open_stand();
	});
}


/*
//Go to the market and sell things
function openMerchantStand() {
	if (is_moving(character)) return;
	if (character.map !== "main") {
		smart_move({ to: "main" }, () => {
			goTownOpenStand();
		});
	} else {
		goTownOpenStand();
	}
	function goTownOpenStand() {
		smart_move({ to: "town" }, () => {
			smart_move({ x: -20 - Math.round(Math.random() * 180), y: - 85 }, () => {
				//Turn around, face front
				smart_move({ x: character.x, y: character.y + 1 }, () => {
					//parent.socket.emit("merchant",{num:41});
					//parent.open_merchant(locate_item("stand0"));
					open_stand();
				});
			});
		});
	}
}
*/




/*
//Close the merchant stand
function closeMerchantStand() {
	//Close merchant Stand
	//parent.socket.emit("merchant", {close:1})
	//parent.close_merchant(locate_item("stand0"));
	close_stand();
}
*/




//Exchange Gems & Quests at the corresponding NPC
function exchangeGemsQuests() {
	if (locateGems("findGems")) {
		close_stand();
		//smart_move({ to: "exchange" }, () => {
		smart_move(find_npc(locateGems("findNpc")), () => {
			exchange(locateGems("getSlotNum"));
			log("Item Exchanged!");
			setTimeout(() => {
				if (!locateGems("findGems")) openMerchantStand();
			}, 6000);
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
			close_stand();
			smart_move(find_npc("craftsman"), () => {
				auto_craft(item);
				setTimeout(() => {
					if (!checkCraftIngredients(item)) openMerchantStand();
				}, 6000);
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

//Dismantle Items
function dismantleItems() {
	if (findDismantleItems("find")) {
		close_stand();
		smart_move(find_npc("craftsman"), () => {
			dismantle(findDismantleItems("slot"));
			setTimeout(() => {
				if (!findDismantleItems("find")) openMerchantStand();
			}, 6000);
		});
		return;
	}
	function findDismantleItems(arg) {
		for (const slot in character.items) {
			if (character.items[slot]) {
				if (arg === "find") {
					if (itemsToDismantle.indexOf(character.items[slot].name) !== -1) return true;
				} else if (arg === "slot") {
					if (itemsToDismantle.indexOf(character.items[slot].name) !== -1) return slot;
				}
			}
		}
	}
}