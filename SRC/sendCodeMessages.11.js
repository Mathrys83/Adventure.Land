//If a characters Health-Potions are exhausted,
//he will request some from other Party-Members
function requestHealthPotion() {
  if (character.ctype === "merchant") return;
  const potions = ["hpot0", "hpot1"];
  potions.forEach((potion) => {
    if (locate_item(potion) === -1) {
      parent.party_list.forEach((member) => {
        if (member !== character.name
          && member !== merchantName) {
          send_cm(member, {
            message: "needHealthPot",
            potion: potion
          });
        }
      });
    }
  });
}