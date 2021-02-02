/*
//############# Start Characters #############

start_character("Magos", "MainLoop");

//############# Create Party #############

send_party_invite("Magos");

//############# Stop Characters #############

stop_character("Magos");

//############# Send Item #############

send_item(StringPlayerName, InventorySlotStartingFrom Zero, Quantity);

send_item("Patroclus", 0, 1);


for(let i = 0; i <= 34; i++){
    send_item("Plutus", i, 500);
}

//############# HOLIDAY BUFF ##############

smart_move({to:"town"}, () => {
    parent.socket.emit("interaction",{type:"newyear_tree"});
});

//############# Move Somewhere #############

//BEST!!! XMOVE moves normally, but if it can't move normally,
it switches to smart_move:

xmove(x,y)

//Short:
smart_move({to:"goo"});

//or long...
smart_move({to:"goo"}, function(){
    game_log("Arrived at Goo!", "#4CE0CC");
});

//############# Log #############

game_log( "Text", "#00FF00");

//############# Max HP / MP #############

character.max_hp
character.max_mp

//############# Use a Skill #############

use_skill("curse");

//############# Check Cooldown of Skill #############

//Check if the cooldown of a class skill has passed
is_on_cooldown(skill)

//############# Party List Array #############

//Returns Array of current party Members
parent.party_list

//############# Target same target as other player #############

let other_player = parent.entities["warrior's name"];
if (other_player) {
    target_id = other_player.target;
    target = parent.entities[target_id];
}

//Iterate over parent.party_list Array to fill other_player

//######## Access certain LIMITED properties of other players ########

game_log(parent.party["Patroclus"].level);

//############# Read other player's properties #############

let x = parent.party_list;
let x1 = x[1];
game_log(parent.entities[x1].max_hp);

//############# Iterate over OTHER players #############

//parent.party_list is an array with the names of PartyMembers
//We iterate over it
parent.party_list.forEach(function(otherPlayerName){
    // !!! IMPORTANT !!! parent.entities ONLY holds OTHER players, NOT
    //the current player running this code!! Therefor....
    let partyMember = parent.entities[otherPlayerName];
    //...we have to check if party member holds something or is undefined!!!
    if (partyMember) {
        game_log(partyMember.name)
    }
});

//############# Buy Item #############

//Buys 10 Mana Potions
buy_with_gold("mpot0", 10);

//############# Log your Items th Console #############

character.items.forEach((element) => game_log("Element " + element.name + "Quantity: " + element.q));

//############# Define a Leader #############

var leader = get_player("Playername");

//############# Go to Leader #############

    if (distance(character, leader) > 100) {
        move(
            character.real_x+(leader.x-character.real_x) / 2,
            character.real_y+(leader.y-character.real_y) / 2
        );
    }

//############# Find item in inventory #############

log(locate_item("mpot0"))

//############# Quantity of an Item in Inventory #############

log(quantity("mpot0"));

//############# Use / Consume an Item from Inventory #############

use(locate_item("hpot0"))
//or
consume(locate_item("hpot0"))

//############# List inventory of Character #############

log(character.items.filter(element => element));

//############# Log all NPCs #############

log(parent.npcs);

//############# Character Queue #############

if(character.q.upgrade) log("Already upgrading something!");

//############# Chat #############

say(); // For Chat
party_say() // For Party Chat

//############# Absolute Position of Party Member #############

parent.party.Magos.x

//############# Load code from File System #############

const STARTUP = 'C:/projects/adventureCode/basicBot/startup.js';
const fs = require('fs');
const data = fs.readFileSync(STARTUP, 'utf8');
eval.apply( window, [data] );

//############# Hotkeys #############

map_key("5","snippet","loadCharacters()");

//############# All Monsters #############

//Coordinates where monsters sparn, their number etc
G.maps.main.monsters

//############# All Map Data! #############

G.maps

//############# Monster Hunt get quest and/or turn in quest #############

parent.socket.emit("monsterhunt");

//############# Monster Hunt Data about current hunt #############

character.s.monsterhunt
show_json(character.s.monsterhunt);

//############# Smart Move Promise Handling #############

//smart_move returns a promise. You can do this to handle failed results:

smart_move(...).then(function(data){
  // on success
}).catch(function(data) {
  if (data.reason === "failed") {
    // Path not found
  }
});

//############# See if Map is accessible #############

let accessible_maps = [];
let todo = [character.map];
while(todo.length){
    let map = todo.pop();
    if(!accessible_maps.includes(map)){ // Check to see if you have already checked the map
        accessible_maps.push(map);
        let doors = parent.G.maps[map].doors;
        for(let i = 0; i < doors.length; i++){
            todo.push(doors[i][4]); // Doors contain multiple properties, the map name is the 5th one (so index 4)
        }
    }
}
console.log(accessible_maps);

//############# Delete Target #############

change_target(null)

//############# Check Target #############

function validateTarget(target){
    if(target
       && target.visible
       && parent.entities[target.id]
       && is_in_range(target,"attack")
       && !target.rip
       && target !== null){
        return true;
    }else{
        return false;
    }
}

//############# Calculate Monster's Difficulty #############

let m = get_nearest_monster()
if(is_monster(m)) {
    show_json(parent.calculate_difficulty(m))
}

0 is easy
1 is difficult
2 is hard


//############# Smart_Move to an NPC, CROSS MAP! #############

smart_move(find_npc("santa"));

//############# Teleport to town #############

parent.socket.emit('town')

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# TEXT #############

//############# Open Local Code Folder #############

In Chat window:

/codes

//############# Save CPU Power #############

In Chat: /pause
In Code: pause()

Stops Rendering

//############# Multiple Steam Windows #############

/new_window

//############# See Chat Functions #############

/help

//############# Open and Close Merchant Stand #############

parent.socket.emit("merchant",{num:}) and parent.socket.emit("merchant",{close:1})
num in the first one being whatever item spot you have your stand in

*/
