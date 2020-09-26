function priestSkills(target) {

	//How much Mana should be kept in reserve
	const manaReserve = 0.7;
	const healingThreshold = 0.8;
	let hurtPartyMembers = 0;

	//Healing (Party-Heal and healing individual characters)
	for (const name of parent.party_list) {
		const partyMember = get_player(name);
		if (partyMember) {
			//Heal COMPLETE Party
			if (partyMember.hp < (partyMember.max_hp * healingThreshold)
				&& partyMember.rip === false) hurtPartyMembers++;
			if (hurtPartyMembers >= 2
				&& character.mp >= G.skills.partyheal.mp
				&& !is_on_cooldown("partyheal")) {
				use_skill("partyheal");
				game_log("Priest is healing Party");
			}
			//Heal ONE Partymember
			if (partyMember.hp < (partyMember.max_hp * healingThreshold)
				&& character.mp >= character.mp_cost
				&& !partyMember.rip
				//&& can_heal(partyMember)
				&& is_in_range(partyMember, "heal")
				&& !is_on_cooldown("heal")) {
				heal(partyMember).then((message) => {
					reduce_cooldown("heal", character.ping);
					game_log("Priest is healing " + partyMember.name);
				}).catch((message) => {
					log(character.name + " Heal failed: " + message.reason);
				});
			}
		}
	}

	if (validateOffensiveSkill(target, manaReserve)
		&& character.mp > (character.max_mp * manaReserve)
		&& character.mp > G.skills.curse.mp
		&& is_in_range(target, "curse")
		&& !is_on_cooldown("curse")) {
		use_skill("curse");
		game_log("Priest cursed the enemy");
	}
}