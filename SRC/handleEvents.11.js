//on_party_invite gets called _automatically_ by the game on an Invite-Event 
function on_party_invite(name) {
	//if (get_player(name) &&		get_player(name).owner !== character.owner) return;
	//if (!get_player(name) || get_player(name).owner !== character.owner) return;
	if (name !== merchantName) return;
	accept_party_invite(name);
}

/*
There are Game-Events and Character-Events.
Reference Game-Events: https://adventure.land/docs/code/game/events
Reference Character-Events: https://adventure.land/docs/code/character/events
*/

//Handles "Stacked" Character-Event
character.on("stacked", (data) => {
	//log("Stacked damage - scattering characters");
	//If there's a master, stay close
	if (requiresMaster.includes(farmMonsterType)) {
		//if (character.name === characterNames[0]) xmove(character.x, character.y + 20);
		if (character.name === characterNames[1]) xmove(character.x + 40, character.y - 45);
		if (character.name === characterNames[2]) xmove(character.x - 40, character.y - 45);
		if (character.name === merchantName) xmove(character.x, character.y - 80);
	}
	//If there is no master, spread the characters around, for better farming efficiency
	else if (!requiresMaster.includes(farmMonsterType)) {
		//if (character.name === characterNames[0]) xmove(character.x, character.y + 60);
		if (character.name === characterNames[1]) xmove(character.x + 70, character.y - 60);
		if (character.name === characterNames[2]) xmove(character.x - 70, character.y - 60);
		if (character.name === merchantName) xmove(character.x, character.y - 80);
	}
});