function mageSkills(target) {

	//How much Mana should be kept in reserve
	const manaReserve = 0.8;
	const hpReserve = 0.5;

	//Energize and Shield Party Members
	//parent.party_list = Array of PartyMembers-Names
	for (const name of parent.party_list) {
		const partyMember = get_player(name);
		if (partyMember) {
			//Shield Partymenber
			if (character.level >= 60
				&& character.mp > G.skills.reflection.mp
				&& partyMember.hp < (partyMember.max_hp * hpReserve)
				&& !partyMember.rip
				&& is_in_range(partyMember, "reflection")
				&& !is_on_cooldown("reflection")) {
				use_skill("reflection", partyMember);
				game_log(`Shielded ${partyMember.name}`);
			}
			//Energize Partymenber
			if (character.level >= 20
				&& partyMember.name !== character.name //No self-energize!
				&& character.mp > (character.max_mp * manaReserve)
				&& partyMember.mp < (partyMember.max_mp * manaReserve)
				&& !partyMember.rip
				&& is_in_range(partyMember, "energize")
				&& !is_on_cooldown("energize")) {
				use_skill("energize", partyMember);
				game_log(`Energized ${partyMember.name}`);
			}
		}
	}

	if (character.mp > (character.max_mp * manaReserve)) {

		//Burst
		if (validateOffensiveSkill(target, manaReserve)
			&& target.hp >= (character.mp * 0.5)
			&& is_in_range(target, "burst")
			&& !is_on_cooldown("burst")) {
			use_skill("burst");
			game_log("Bursting enemy");
		}

		//Controlled burst
		if (character.level >= 75
			&& !master
			//Only use these skills against weak monsters
			&& !requiresMaster.includes(farmMonsterType)
			&& !is_on_cooldown("cburst")
			&& character.mp > G.skills.cburst.mp) {
			let targets = Object.values(parent.entities).filter(entity => entity.mtype === farmMonsterType && entity.level <= 1 && is_in_range(entity, "cburst"));
			let targets2 = [];
			let maxTargets = Math.floor(character.mp / (target.max_hp * 1.85));
			for (target of targets) {
				targets2.push([target, target.max_hp * 1.8]);
				if (targets2.length === maxTargets) break;
			}
			use_skill("cburst", targets2);
			game_log("Used controlled Burst");
		}
	}
}