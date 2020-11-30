function getHolidayBuff() {

	if (!character.s.holidayspirit) {
		smart_move({ to: "town" }, () => {
			parent.socket.emit("interaction", { type: "newyear_tree" });
		});
	}
}