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
			log("Stopped character " + characterName);
		}
	}
}

function addButons() {
	add_bottom_button("move2Main", "🏠", () => {
		smart_move({ to: "main" });
	});
	add_bottom_button("move2Farm", "🚜", () => {
		getFarmingSpot(farmMonsterType, "move");
	});
	add_bottom_button("showStatus", "📈", showStatus);
	add_bottom_button("toggleMerchantStand", "🛒", () => {
		character.stand ? parent.close_merchant(locate_item("stand0")) : parent.open_merchant(locate_item("stand0"));
	});
	add_bottom_button("Pause", "⏸️", pause);

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

function transferLoot(merchantName) {
	if (character.ctype === "merchant") return;
	let merchant = get_player(merchantName);
	let keepItems = ["hpot0", "mpot0", "hpot1", "mpot1",
		"elixirdex0", "elixirdex1", "elixirdex2",
		"elixirint0", "elixirint1", "elixirint2",
		//"elixirvit0", "elixirvit1", "elixirvit2",
		//"elixirstr0", "elixirstr1", "elixirstr2",
		//"elixirluck"
	];
	if (character.ctype !== "merchant"
		&& merchant
		&& merchant.owner === character.owner
		&& distance(character, merchant) < 400) {
		//Transfer Gold
		if (character.gold > 1000) send_gold(merchant, character.gold)
		//Transfer Items
		character.items.forEach((item, index) => {
			if (item && !keepItems.includes(item.name)) send_item(merchant, index, 9999);
		});
		log(character.name + " sent items to merchant.");
	}
}

function tidyInventory() {
	for (let i = 34; i > 0; i--) {
		if (character.items[i] && !character.items[i - 1]) {
			swap(i, i - 1)
			log("Tidying Inventory... Slot: " + i);
		}
	}
}

function relocateItems() {

	if (locate_item("hpot1") !== -1
		&& locate_item("hpot1") !== 35) swap(locate_item("hpot1"), 35);
	if (locate_item("mpot1") !== -1
		&& locate_item("mpot1") !== 36) swap(locate_item("mpot1"), 36);
	if (locate_item("hpot0") !== -1
		&& locate_item("hpot0") !== 37) swap(locate_item("hpot0"), 37);
	if (locate_item("mpot0") !== -1
		&& locate_item("mpot0") !== 38) swap(locate_item("mpot0"), 38);
}

//on_party_invite gets called _automatically_ by the game on an invite 
function on_party_invite(name) {
	if (get_player(name) &&
		get_player(name).owner !== character.owner) return;
	accept_party_invite(name);
}

//Replenish Health and Mana
function usePotions() {
	if (!character.rip) {
		//If character has at least half of maxHP but no Mana, use Mana Potion
		if (!is_on_cooldown("use_mp")
			&& character.hp > (character.max_hp / 2)
			&& character.mp < (character.max_mp / 5)
			&& (locate_item("mpot1") !== -1 || locate_item("mpot0") !== -1)) {
			if (locate_item("mpot1") !== -1) consume(locate_item("mpot1"));
			if (locate_item("mpot0") !== -1) consume(locate_item("mpot0"));
			//If character has no potions, generate them
		} else if (!is_on_cooldown("use_hp") || !is_on_cooldown("use_mp")
			&& (character.hp < (character.max_hp - 150)
				|| character.mp < (character.max_mp - 250))
			&& locate_item("mpot0") === -1
			&& locate_item("mpot1") === -1
			&& locate_item("hpot0") === -1
			&& locate_item("hpot1") === -1) {
			use_hp_or_mp();
		} else if (!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - 400) && locate_item("hpot1") !== -1)) {
			consume(locate_item("hpot1"));
		} else if (!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - 500) && locate_item("mpot1") !== -1)) {
			consume(locate_item("mpot1"));
		} else if (!is_on_cooldown("use_hp") && (character.hp < (character.max_hp - 200) && locate_item("hpot0") !== -1)) {
			consume(locate_item("hpot0"));
		} else if (!is_on_cooldown("use_mp") && (character.mp < (character.max_mp - 300) && locate_item("mpot0") !== -1)) {
			consume(locate_item("mpot0"));
		}
	}
}

function drinkPotions() {
	if (character.ctype === "merchant") return;
	let potions = ["elixirdex0", "elixirdex1", "elixirdex2",
		"elixirint0", "elixirint1", "elixirint2",
		//"elixirvit0", "elixirvit1", "elixirvit2",
		//"elixirstr0", "elixirstr1", "elixirstr2",
		//"elixirluck"
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

//Follow master character
function followMaster() {
	const masterMaxDist = 10;
	if (master && character.name !== master) {
		//If master is on screen, follow him
		if (get_player(master)) {
			let theMaster = get_player(master);
			if (Math.abs(character.x - theMaster.x) > masterMaxDist || Math.abs(character.y - theMaster.y) > masterMaxDist) {
				log("Following Master with Get_Player");
				xmove(theMaster.x, theMaster.y);
			}
		}
		//If the master is too far away,
		//followers read masters location from localStorage
		else if (!get_player(master)
			&& get("MasterPos")) {
			let masterPos = get("MasterPos");
			if (character.map !== masterPos.map) {
				log("Following Master Map from Local Storage");
				smart_move(masterPos.map);
			} else if (Math.abs(character.x - masterPos.x) > masterMaxDist || Math.abs(character.y - masterPos.y) > masterMaxDist) {
				log("Following Master Coordinates from Local Storage");
				xmove(masterPos.x, masterPos.y);
			}
		}
	}
}

//Master character lays breadcrumbs
function masterBreadcrumbs() {
	//Master writes location to localStorage
	if (master && character.name === master) {
		set("MasterPos", { map: character.map, x: Math.floor(character.x), y: Math.floor(character.y) });
	}
}

function showStatus() {
	show_json({
		hunterToggle: hunterToggle ? "✅ Hunter Toggle is active! Happy hunting!" : "❌ Hunter Toggle is deactivated...",
		huntedMonster: !!get("huntedMonsters").length ? `🏹 You're hunting ${G.monsters[get("huntedMonsters")[get("huntedMonsters").length - 1].monsterType].name}s at ${farmMap}.` : "🤷 No hunter quest active.",
		farmedMonster: !!get("huntedMonsters").length ? `🤷 No farming while a hunter quest is active.` : `🚜 You're farming ${G.monsters[farmMonsterType].name}s at ${farmMap}`,
		master: !!master ? `👑 ${master} is the master for ${!!get("huntedMonsters").length ? "hunting" : "farming"} ${G.monsters[farmMonsterType].name}s.` : `👨‍🌾 No master needed to ${!!get("huntedMonsters").length ? "hunt" : "farm"} ${G.monsters[farmMonsterType].name}s.`
	});
}