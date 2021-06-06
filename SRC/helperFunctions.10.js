function loadCharacters() {
	characterNames.forEach((name, index) => {
		setTimeout(() => {
			if (!Object.keys(get_active_characters()).includes(name)) {
				start_character(name, "MainLoop");
				//Debug
				set(`Loaded ${Date().substring(0, 24)}`, name);
				return;
			}
		}, index * 10000);
	});
}

function initParty() {
	for (const name of characterNames) {
		if (!Object.keys(get_party()).includes(name)) send_party_invite(name);
	}
}

function stopCharacters() {
	for (const characterName in get_active_characters()) {
		if (characterName !== character.name) {
			stop_character(characterName);
			log(`Stopped character ${characterName}`);
		}
	}
}

function addButtons() {
	add_bottom_button("TeleportTown", "🌀", () => {
		parent.socket.emit('town');
	});
	add_bottom_button("move2Main", "🏠", () => {
		smart_move({ to: "main" });
	});
	add_bottom_button("move2Bank", "💰", () => {
		smart_move({ to: "bank" });
	});
	add_bottom_button("move2Farm", "🚜", () => {
		smart_move(farmingSpotData);
	});
	add_bottom_button("showStatus", "📈", showStatus);
	add_bottom_button("toggleMerchantStand", "🛒", () => {
		character.stand ? close_stand() : open_stand();
	});
	add_bottom_button("Pause", "⏸️", pause);
}

//If character is moving, do nothing
function moveInterrupt() {
	//If any character is smart_moving, interrupt.
	//All longer distances are smart_moved
	if (smart.moving
		//If the character isn't a merchant
		//and he's far from the farming spot, interrupt
		//When close to farming spot, no interrupt (For kiting).
		|| (character.ctype !== "merchant"
			&& is_moving(character)
			&& distance(character, farmingSpotData) > farmingSpotMaxDist)) return true;
}

function transferLoot(merchantName) {
	if (character.ctype === "merchant") return;
	const merchant = get_player(merchantName);
	const keepItems = [
		//Items
		"tracker", "computer",
		//Orbs
		"jacko", "orbg", "talkingskull",
		//Gloves
		"handofmidas", "mpgloves", "mmgloves", "mrngloves",
		//Offhands
		"lantern", "wbook1", "t2quiver",
		//Potions & Elixirs
		"hpot0", "mpot0", "hpot1", "mpot1",
		"elixirdex0", "elixirdex1", "elixirdex2",
		"elixirint0", "elixirint1", "elixirint2",
		//"elixirvit0", "elixirvit1", "elixirvit2",
		//"elixirstr0", "elixirstr1", "elixirstr2",
		"elixirluck", "bunnyelixir", "pumpkinspice"
	];
	if (character.ctype !== "merchant"
		&& merchant
		&& merchant.owner === character.owner
		&& distance(character, merchant) < 400) {
		//Transfer Gold
		if (character.gold > 1000) send_gold(merchant, character.gold)
		//Transfer Items
		character.items.forEach((item, index) => {
			if (item && !keepItems.includes(item.name)) {
				send_item(merchant, index, 9999);
				log("Sent items to merchant.");
			}
		});
		//Send spare jackos to the merchant, too [Deactivated: Jackos don't drop from monsters, only from rare candy]
		//if (locate_item("jacko") !== -1 && locate_item("jacko") !== 40) send_item(merchant, locate_item("jacko"), 9999);
	}
}

function tidyInventory() {
	for (let i = 0; i <= 34; i++) {
		if (character.items[i] === null) {
			for (let j = 34; j > i; j--) {
				if (character.items[j]) swap(j, i);
			}
		}
	}
}

//Relocate certain items to certain slots
function relocateItems() {
	//All Characters Special Items
	if (locate_item("tracker") !== -1
		&& locate_item("tracker") !== 0) swap(locate_item("tracker"), 0);
	if (locate_item("jacko") !== -1
		&& locate_item("jacko") !== 1) swap(locate_item("jacko"), 1);
	//Only farmers have Hand of Midas
	if (character.ctype !== "merchant"
		&& locate_item("handofmidas") !== -1
		&& locate_item("handofmidas") !== 2) swap(locate_item("handofmidas"), 2);
	//Only Priest and Mage have a lantern
	if ((character.ctype !== "priest"
		|| character.ctype !== "mage")
		&& locate_item("lantern") !== -1
		&& locate_item("lantern") !== 3) swap(locate_item("lantern"), 3);
	//Only merchant has fishing-rod and pickaxe
	if (character.ctype === "merchant") {
		if (locate_item("rod") !== -1
			&& locate_item("rod") !== 39) swap(locate_item("rod"), 39);
		if (locate_item("pickaxe") !== -1
			&& locate_item("pickaxe") !== 40) swap(locate_item("pickaxe"), 40);
	}
	//Potions
	if (locate_item("hpot1") !== -1
		&& locate_item("hpot1") !== 35) swap(locate_item("hpot1"), 35);
	if (locate_item("mpot1") !== -1
		&& locate_item("mpot1") !== 36) swap(locate_item("mpot1"), 36);
	if (locate_item("hpot0") !== -1
		&& locate_item("hpot0") !== 37) swap(locate_item("hpot0"), 37);
	if (locate_item("mpot0") !== -1
		&& locate_item("mpot0") !== 38) swap(locate_item("mpot0"), 38);
}

//Replenish Health and Mana
function usePotions() {
	if (!character.rip) {
		//Emergency Mana [For Scare-Ability]
		if (!is_on_cooldown("use_mp")
			//If character has at least half of it's HP...
			&& (character.hp >= (character.max_hp / 2)
				//Or almost no HP
				|| character.hp <= (character.max_hp / 10))
			//And almost no MP...
			&& character.mp <= (character.max_mp / 10)) {
			//...consume Mana Potions
			useMp();
			log("Using emergency MP");
			// ## Use regular potions ##
			//If below half HP, use HP
		} else if (character.hp <= (character.max_hp / 2)) {
			useHp();
			//If above half HP but below half MP, use MP
		} else if (character.mp <= (character.max_mp / 2)) {
			useMp();
			//If above half HP and half MP, use HP
		} else if (character.hp <= character.max_hp - G.items.hpot0.gives[0][1]) {
			useHp();
			//If full HP use MP
		} else if (character.mp <= character.max_mp - G.items.mpot0.gives[0][1]) {
			useMp();
		}

		function useHp() {
			if (!is_on_cooldown("use_hp")) {
				if (locate_item("hpot1") !== -1) {
					consume(locate_item("hpot1"));
				} else if (locate_item("hpot0") !== -1) {
					consume(locate_item("hpot0"));
				} else {
					use_skill("use_hp");
				}
			}
		}

		function useMp() {
			if (!is_on_cooldown("use_mp")) {
				if (locate_item("mpot1") !== -1) {
					consume(locate_item("mpot1"));
				} else if (locate_item("mpot0") !== -1) {
					consume(locate_item("mpot0"));
				} else {
					use_skill("use_mp");
				}
			}
		}
	}
}

//If a characters Health / Mana Potions are exhausted,
//it will request some from other Party-Members
function requestPotions() {
	if (character.ctype === "merchant") return;
	const potions = ["hpot0", "hpot1", "mpot0", "mpot1"];
	let recipients = [];
	let neededPotions = [];
	for (member of parent.party_list) if (member !== character.name && member !== merchantName) recipients.push(member);
	for (potion of potions) if (locate_item(potion) === -1) neededPotions.push(potion);
	if (neededPotions.length) {
		send_cm(recipients, {
			message: "needPotions",
			potions: neededPotions
		});
	}
}

//Drink Elixirs
function drinkElixirs() {
	if (character.ctype === "merchant") return;
	const potions = [
		"elixirdex2", "elixirdex1", "elixirdex0",
		"elixirint2", "elixirint1", "elixirint0",
		//"elixirvit0", "elixirvit1", "elixirvit2",
		//"elixirstr0", "elixirstr1", "elixirstr2",
		"elixirluck", "bunnyelixir", "pumpkinspice"
	];
	if (!character.slots.elixir) {
		for (const potion of potions) {
			if (locate_item(potion) !== -1) {
				consume(locate_item(potion));
				return;
			}
		}
	}
}

function lootMidas() {
	if (character.ctype === "merchant") return;
	//If farmMonsterType doesn't require a master, equip handofmidas permanently and loot every tick
	if (!requiresMaster.includes(farmMonsterType)
		&& distance(character, farmingSpotData) < 200) {
		equipMidasAndLoot();
		//If farmMonsterType does require a master:
		//- Check if there are chests
		//- The master will loot 
		//- If there's no master around, character will loot
	} else if (requiresMaster.includes(farmMonsterType)
		&& Object.keys(get_chests()).length
		&& (character.name === master || !get_player(master))) {
		equipMidasAndLoot();
	} else {
		equipRegularGloves();
	}
	function equipMidasAndLoot() {
		if (character.slots.gloves?.name !== "handofmidas" && locate_item("handofmidas") !== -1) equip(locate_item("handofmidas"));
		loot();
	}
	function equipRegularGloves() {
		if (character.ctype === "priest") equipGloves("mpgloves");
		if (character.ctype === "mage") equipGloves("mmgloves");
		if (character.ctype === "ranger") equipGloves("mrngloves");

		function equipGloves(gloveModel) {
			if (character.slots.gloves?.name !== gloveModel && locate_item(gloveModel) !== -1) equip(locate_item(gloveModel));
		}
	}
}

//Equip the Lantern when hunting specialMonsters
//[Only Priest & Mage - Ranger can't equip it!]
function equipLantern(monsterType) {
	if (character.ctype === "merchant" || character.ctype === "ranger") return;
	//If farmMonsterType is a special monster, equip the lantern
	if (specialMonsters.includes(monsterType)
		&& distance(character, farmingSpotData) < 200) {
		if (character.slots.offhand?.name !== "lantern" && locate_item("lantern") !== -1) equip(locate_item("lantern"));
		//If farmMonsterType is a regular monster, equip regular Book of Secrets
	} else {
		if (character.slots.offhand?.name !== "wbook1" && locate_item("wbook1") !== -1) equip(locate_item("wbook1"));
	}
}

//Retrieve items from Bank
function retrieveFromBank(item) {
	//Loops through bank-sections
	for (const box in character.bank) {
		//Can't retrieve  anything from gold-box
		if (box === "gold") continue;
		//Loops through individual bank-slots
		for (const slot in character.bank[box]) {
			if (character.bank[box][slot]) {
				if (character.bank[box][slot].name === item) {
					bank_retrieve(box, slot);
					return;
				}
			}
		}
	}
}

//Master character lays breadcrumbs
function masterBreadcrumbs() {
	//Master writes location to localStorage
	if (master && character.name === master) set("MasterPos", {
		map: character.map,
		in: character.in,
		x: Math.floor(character.x),
		y: Math.floor(character.y)
	});
}

//Follow master character
function followMaster() {
	const theMaster = get_player(master);
	if (master && character.name !== master) {
		//If master is on screen, follow him
		if (theMaster
			&& Math.round(distance(character, theMaster)) > masterMaxDist) {
			//log("Following Master with Get_Player");
			xmove(theMaster.x, theMaster.y);
		}
		//If the master is too far away,
		//followers read masters location from localStorage
		else if (!theMaster
			&& get("MasterPos")) {
			//log("Following Master from Local Storage");
			smart_move(get("MasterPos"));
		}
		//Fallback
	} else {
		smart_move(farmingSpotData);
	}
}

function showStatus() {
	show_json({
		hunterToggle: hunterToggle ? "✅ Hunter Toggle is active! Happy hunting!" : "❌ Hunter Toggle is deactivated...",
		huntedMonster: !!get("huntedMonsters").length ? `🏹 You're hunting ${farmMonsterType}s at ${farmingSpotData.map}.` : "🤷 No hunter quest active.",
		farmedMonster: !!get("huntedMonsters").length ? `🤷 No farming while a hunter quest is active.` : `🚜 You're farming ${farmMonsterType}s at ${farmingSpotData.map}`,
		master: !!master ? `👑 ${master} is the master for ${!!get("huntedMonsters").length ? "hunting" : "farming"} ${farmMonsterType}s.` : `👨‍🌾 No master needed to ${!!get("huntedMonsters").length ? "hunt" : "farm"} ${farmMonsterType}s.`
	});
}

//Get Holiday Buff
function getHolidayBuff() {
	if (!character.s.holidayspirit) {
		smart_move({ to: "town" }, () => {
			parent.socket.emit("interaction", { type: "newyear_tree" });
		});
	}
}

//Small chance (1 in 100) to send a small tip to the Developer of this code. Thank you. 👋🏼
function tipDev() {
	const devChars = ["Plutus", "Hierophant", "Magos", "Patroclus"];
	for (const char of devChars) {
		if (get_player(char) && Math.floor(Math.random() * 100) === 1) {
			let tip = 0;
			if (character.level < 20) {
				tip = 9; //One Goo
			} else if (character.level >= 20 && character.level < 40) {
				tip = 97; //One Tortoise
			} else if (character.level >= 40 && character.level < 60) {
				tip = 196; //One Iceroamer
			} else if (character.level >= 60 && character.level < 70) {
				tip = 320; //One BBPomPom
			} else if (character.level >= 70 && character.level < 80) {
				tip = 905; //One XScorpion
			} else if (character.level >= 80) {
				tip = 999; //If my code brought you to level 80, it's worth it! :)
			}
			send_gold(get_player(char), tip);
		}
	}
}