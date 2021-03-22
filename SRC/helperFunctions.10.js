function loadCharacters() {
	characterNames.forEach((name, index) => {
		setTimeout(() => { if (!Object.keys(get_active_characters()).includes(name)) start_character(name, "MainLoop") }, index * 10000);
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
		getFarmingSpot(farmMonsterType, "move");
	});
	add_bottom_button("showStatus", "📈", showStatus);
	add_bottom_button("toggleMerchantStand", "🛒", () => {
		character.stand ? close_stand() : open_stand();
	});
	add_bottom_button("Pause", "⏸️", pause);
}

function transferLoot(merchantName) {
	if (character.ctype === "merchant") return;
	let merchant = get_player(merchantName);
	let keepItems = [
		//Items
		"tracker",
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
		"elixirluck"
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
		//Send spare jackos to the merchant, too
		//if (locate_item("jacko") !== -1 && locate_item("jacko") !== 40) send_item(merchant, locate_item("jacko"), 9999);
	}
}

function tidyInventory() {
	for (let i = 34; i > 0; i--) {
		if (character.items[i] && !character.items[i - 1]) swap(i, i - 1);
	}
}

//Relocate certain items to certain slots
function relocateItems() {
	if (locate_item("hpot1") !== -1
		&& locate_item("hpot1") !== 35) swap(locate_item("hpot1"), 35);
	if (locate_item("mpot1") !== -1
		&& locate_item("mpot1") !== 36) swap(locate_item("mpot1"), 36);
	if (locate_item("hpot0") !== -1
		&& locate_item("hpot0") !== 37) swap(locate_item("hpot0"), 37);
	if (locate_item("mpot0") !== -1
		&& locate_item("mpot0") !== 38) swap(locate_item("mpot0"), 38);
	if (locate_item("tracker") !== -1
		&& locate_item("tracker") !== 39) swap(locate_item("tracker"), 39);
	if (locate_item("jacko") !== -1
		&& locate_item("jacko") !== 40) swap(locate_item("jacko"), 40);
}

//Replenish Health and Mana
function usePotions() {
	if (!character.rip) {
		//If character has at least half of Max_HP but no Mana, use Mana Potion
		//If character has almost no Mana, also use Mana Potion [To be able to use Scare-Ability]
		if (!is_on_cooldown("use_mp")
			//If character has at least half of it's Hp...
			&& character.hp > (character.max_hp / 2)
			//And less than it's maximum MP...
			&& (character.mp <= character.max_mp - (G.items.mpot0.gives[0][1] - 1)
				//Or almost no MP...
				|| character.mp < (character.max_mp / 10))
			&& (locate_item("mpot1") !== -1 || locate_item("mpot0") !== -1)) {
			if (locate_item("mpot1") !== -1
				&& character.mp < (character.max_mp - G.items.mpot1.gives[0][1])) {
				consume(locate_item("mpot1"));
			} else if (locate_item("mpot0") !== -1
				&& character.mp < (character.max_mp - G.items.hpot0.gives[0][1])) {
				consume(locate_item("mpot0"));
			}
			//Use regular potions
		} else if (!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - G.items.hpot1.gives[0][1]) && locate_item("hpot1") !== -1)) {
			consume(locate_item("hpot1"));
		} else if (!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - G.items.mpot1.gives[0][1]) && locate_item("mpot1") !== -1)) {
			consume(locate_item("mpot1"));
		} else if (!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - G.items.hpot0.gives[0][1]) && locate_item("hpot0") !== -1)) {
			consume(locate_item("hpot0"));
		} else if (!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - G.items.mpot0.gives[0][1]) && locate_item("mpot0") !== -1)) {
			consume(locate_item("mpot0"));
			//If character has no potions, generate them
		} else if ((!is_on_cooldown("use_hp") || !is_on_cooldown("use_mp"))
			&& (character.hp < (character.max_hp - G.items.hpot0.gives[0][1])
				|| character.mp < (character.max_mp - G.items.mpot0.gives[0][1]))
			&& locate_item("mpot0") === -1
			&& locate_item("mpot1") === -1
			&& locate_item("hpot0") === -1
			&& locate_item("hpot1") === -1) {
			use_hp_or_mp();
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
	let potions = [
		"elixirdex2", "elixirdex1", "elixirdex0",
		"elixirint2", "elixirint1", "elixirint0",
		//"elixirvit0", "elixirvit1", "elixirvit2",
		//"elixirstr0", "elixirstr1", "elixirstr2",
		"elixirluck"
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
		if (character.slots.gloves.name !== "handofmidas" && locate_item("handofmidas") !== -1) equip(locate_item("handofmidas"));
		loot();
	}
	function equipRegularGloves() {
		if (character.ctype === "priest") equipGloves("mpgloves");
		if (character.ctype === "mage") equipGloves("mmgloves");
		if (character.ctype === "ranger") equipGloves("mrngloves");

		function equipGloves(gloveModel) {
			if (character.slots.gloves.name !== gloveModel && locate_item(gloveModel) !== -1) equip(locate_item(gloveModel));
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
		if (character.slots.offhand.name !== "lantern" && locate_item("lantern") !== -1) equip(locate_item("lantern"));
		//If farmMonsterType is a regular monster, equip regular Book of Secrets
	} else {
		if (character.slots.offhand.name !== "wbook1" && locate_item("wbook1") !== -1) equip(locate_item("wbook1"));
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
	let theMaster = get_player(master);
	const masterMaxDist = 50;
	if (master && character.name !== master) {
		//If master is on screen, follow him
		if (theMaster
			&& Math.ceil(distance(character, theMaster)) > masterMaxDist) {
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
	}
}

function showStatus() {
	show_json({
		hunterToggle: hunterToggle ? "✅ Hunter Toggle is active! Happy hunting!" : "❌ Hunter Toggle is deactivated...",
		huntedMonster: !!get("huntedMonsters").length ? `🏹 You're hunting ${G.monsters[get("huntedMonsters")[get("huntedMonsters").length - 1].monsterType].name}s at ${farmingSpotData.map}.` : "🤷 No hunter quest active.",
		farmedMonster: !!get("huntedMonsters").length ? `🤷 No farming while a hunter quest is active.` : `🚜 You're farming ${G.monsters[farmMonsterType].name}s at ${farmingSpotData.map}`,
		master: !!master ? `👑 ${master} is the master for ${!!get("huntedMonsters").length ? "hunting" : "farming"} ${G.monsters[farmMonsterType].name}s.` : `👨‍🌾 No master needed to ${!!get("huntedMonsters").length ? "hunt" : "farm"} ${G.monsters[farmMonsterType].name}s.`
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