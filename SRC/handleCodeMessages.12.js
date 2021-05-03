//Handles all incoming CodeMessages
function on_cm(name, data) {
  if (get_player(name)
    && get_player(name).owner === character.owner) {

    //Handles all CM's
    if (data.message === "needPotions") sendPotion(name, data);
  }
}

//Sends Potions to Partymembers
function sendPotion(name, data) {
  if (character.ctype === "merchant") return;
  for (potion of data.potions) if (locate_item(potion) !== -1 && quantity(potion) >= 2) send_item(name, locate_item(potion), Math.floor(quantity(potion) / 2));
  //log(`Got cm from ${name} requesting ${data.potions}`, "red")
}