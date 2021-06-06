// Kites target
function kiteTarget(target) {

	if (target) {
		const minTargetDist = target.range * 1.1;
		const kiteFlip = target.range * 0.5;
		const targetDistance = distance(character, target);

		if (targetDistance < minTargetDist && targetDistance > kiteFlip) {
			xmove(
				character.real_x + (character.real_x - target.x),
				character.real_y + (character.real_y - target.y)
			);
		}
		if (distance(character, target) < kiteFlip) {
			xmove(
				character.real_x - (character.real_x - target.x) + minTargetDist,
				character.real_y - (character.real_y - target.y) + minTargetDist
			);
		}
	}
}

//Circles Target
function circleTarget(target) {

	if (target) {

		const minTargetDist = target.range * 1.5;
		const targetDistance = distance(character, target);
		let offset = 1;

		if (!get("Offset_" + character.name)) {
			set("Offset_" + character.name, 1);
		} else {
			offset = Number(get("Offset_" + character.name));
			offset += 0.7;
			if (offset >= 999999) offset = 1;
			set("Offset_" + character.name, offset);
		}
		if (targetDistance < minTargetDist) {
			xmove(
				target.x + (minTargetDist * Math.sin(offset)),
				target.y + (minTargetDist * Math.cos(offset))
			);
		}
	}
}