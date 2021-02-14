//Handles all incoming CodeMessages
function on_cm(name, data) {
  if (get_player(name)
    && get_player(name).owner === character.owner) {

    //Handles all CM's
    if (data.message === "needHealthPot") sendHealthPotion(name, data);
  }
}

//Sends Health Potions to Partymembers
function sendHealthPotion(name, data) {
  if (character.ctype === "merchant") return;
  if (locate_item(data.potion) !== -1
    && quantity(data.potion) >= 2) send_item(name, locate_item(data.potion), Math.floor(quantity(data.potion) / 2));
}