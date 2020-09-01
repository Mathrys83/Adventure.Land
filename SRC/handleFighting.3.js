function validateTarget(target){
	if(target 
	   && target.visible
	   && parent.entities[target.id]
	   && is_in_range(target,"attack")
	   && !target.dead
	   && target !== null){
		return true;
	}else{
		return false;
	}
}

function getTarget(){

	let target = get_targeted_monster();
	if(validateTarget(target)){
		return target;
	}else{
		change_target(null);
	}
	//If there is no master, or character is master, choose target freely
	if((!master && !target) || character.name == master){
		//Returns monster that targets character
		target = get_nearest_monster({
			target:character.name
		});
		if(validateTarget(target)){
			log(character.name + " Target monster that targets character");
			change_target(target);
			return target;
		}
		//Returns monster that targets party-member
		parent.party_list.forEach(partyMemberName => {
			target = get_nearest_monster({target:partyMemberName});
			if(validateTarget(target)){
				log(character.name + " Target monster that targets party-member");
				change_target(target);
				return target;
			}
		});
		//Returns any monster that targets nobody
		target = get_nearest_monster({
			type:farmMonsterType,
			no_target:true
		});
		if(validateTarget(target)){
			log(character.name + " Target monster that targets nobody");
			change_target(target);
			return target;
		}
	//If there is a master, target masters target
	} else if(master
			  && get_player(master) 
			  && get_player(master).target
			  && character.name !== master){
		/*
		get_player(master).target only returns the target ID,
		NOT the ENTITY (Object)!
		We therefor have to search parent.entities[] for the target ID,
		which will return an ENTITY (Object) again!
		The upper part works, because get_nearest_monster()
		returns ENTITIES, too!
		*/
		target = parent.entities[get_player(master).target];
		if(validateTarget(target)){
			log(character.name + " Target master's target");
			change_target(target);
			return target;
		}
	}else{
		change_target(null);
		return null;
	}
}

function autoFight(target){
	if(validateTarget(target)){	
		if(!is_in_range(target, "attack")){
			log(character.name + "Target not in range, moving to it");
			xmove(
				character.x + Math.floor((target.x -character.x) * 0.3),
				character.y + Math.floor((target.y - character.y) * 0.3)
			);
		}
		else if (!is_on_cooldown("attack")){
			attack(target).then((message) => {
				reduce_cooldown("attack", character.ping);
			}).catch((message) => {
				log(character.name + " attack failed: " + message.reason);
			});
		}
	}
}