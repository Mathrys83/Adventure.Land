function mageSkills(target) {

	//How much Mana should be kept in reserve
	const manaReserve = 0.8;
	const hpReserve = 0.8;

	//Energize and Shield Party Members
	//parent.party_list = Array of PartyMembers-Names
	for (const name of parent.party_list) {
		const partyMember = get_player(name);
		if (partyMember) {
			//Shield Partymenber
			if (character.mp > G.skills.reflection.mp
				&& partyMember.hp < (partyMember.max_hp * hpReserve)
				&& !partyMember.rip
				&& is_in_range(partyMember, "reflection")
				&& !is_on_cooldown("reflection")) {
				use_skill("reflection", partyMember);
				game_log("Mage shielded " + partyMember.name);
			}
			//Energize Partymenber
			if (partyMember.name !== character.name //No self-energize!
				&& character.mp > (character.max_mp * manaReserve)
				&& partyMember.mp < (partyMember.max_mp * manaReserve)
				&& !partyMember.rip
				&& is_in_range(partyMember, "energize")
				&& !is_on_cooldown("energize")) {
				use_skill("energize", partyMember);
				game_log("Mage energized " + partyMember.name);
			}
		}
	}

	//Burst
	if (validateOffensiveSkill(target, manaReserve)
		&& character.mp > (character.max_mp * manaReserve)
		&& target.hp >= (character.mp * 0.5)
		&& is_in_range(target, "burst")
		&& !is_on_cooldown("burst")) {
		use_skill("burst");
		game_log("Mage bursting enemy");
	}
}