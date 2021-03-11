//If a characters Health / Mana Potions are exhausted,
//he will request some from other Party-Members
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




