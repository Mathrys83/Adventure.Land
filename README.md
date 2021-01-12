# Adventure.Land

This is my code for Adventure.Land, an epic indie MMO RPG, where you have to write JavaScript code to fully automate everything that happens.

You can see the game live with [this realtime live-view](https://adventure.land/comm?scale=2)! :)
The officlal website of the game can be found [here](https://adventure.land/).
This is the [Youtube Trailer of the game](https://www.youtube.com/watch?v=HJAj9u2TEZc).

## What the game is about

The basic idea of the game itself is super appealing: The most forbidden thing in *any* game, is to write a bot for it. *Here, BOTTING IS THE GAME!* :)

![Adventure.Land Farming Party](https://github.com/johnnyawesome/Adventure.Land/blob/master/DemoImg/AdventureLandFarming.gif)

(This is not my first coding game, I also played [Screeps](https://screeps.com/), and you can [check out my source here](https://github.com/johnnyawesome/Screeps)).

## Battletested

This code is simple, but *it works*, I made sure of that.

I only publish a new version of my Adventure.Land scripts after they ran flawlessly over several days.

I try to make sure that if you use (some or all of) my code, *it works, and it's stable and reliable*.

## Getting started

These are two great guides that will give you an overview over the game:

- [Sin's Guide to life in Adventure Land](https://steamcommunity.com/sharedfiles/filedetails/?id=1636142608)
- [FAQ's by Trexnamedtom](https://steamcommunity.com/sharedfiles/filedetails/?id=1640326394)

## Code overview

The game lets you create multiple modules, which I did, to keep things organized.

**Update: Now, the only place where you have to adjust character-names, is in the "Main" module.**

Most code I've seen has one single "main" loop that runs ~250ms, so 4 times per second. This is suggested for optimal farming performance.
My code does have two "main" loops. Running everything every 250 milliseconds might give you great farming-performance, but it's horrible for performance overall. Therefor, I made a "tierTwo" loop that only runs every 3 seconds. All non-essential routines get called from there.

## The Characters

You can use four characters at the same time, I opted for:

- Mage
- Priest
- Ranger
- Merchant

![Adventure.Land Farming Party](https://github.com/johnnyawesome/Adventure.Land/blob/master/DemoImg/AdventureLandFarming.gif)

The merchant is the most capable character so far. Most people only use him to sell things on the marketplace.
My code takes a different approach: Because the merchant cannot generate gold on his own, he acts as support-character for the party, so they don't get interrupted and can keep farming 100% of the time.

## What the code does

This is a work in progress, and things will change. I don't have a high level yet, and can only farm low level enemies.
Once I can go for harder enemies, the code will most certainly change a lot.

Here's a list of what the code is capable of so far:

## General

- Hotkeys: To load characters / create a party / stop characters
- Custom Buttons for quick access to frequently used functions
- Auto-move to the designated farming spot, over several maps / continents.
- Auto-Farm designated monsters
- New: Multi-monster farming! Designate multiple monsters to be farmed. Your characters will then farm several different monsters per day (in addition to their hunting quests).
- Auto-use potions (health & mana)
- Auto-Kite enemies. (All characters I use (Mage, Priest, Ranger) are ranged characters.)
- Two Kiting-Modes (Walk backwards / circle around the target)
- Seashells get exchanged for buff-potions
- Buff-Potions get delivered to characters which consume them automatically
- Fetch Hunting-Quests
- Go hunting
- Turn in fulfilled Hunting-Quests
- (Farming / Hunting) Small enemies get attacked by individual characters
- (Farming / Hunting) Big enemies get attacked by all characters (All characters target one single enemy)
- Master-Mode (Define a master the other characters follow. Also: Only the master chooses targets. All characters then attack the chosen target. this lets you take on bigger enemies!)

## Individual characters

- The mage can: auto-attack enemies (farming), energize partymembers, burst enemies and shield hurt allies from damage
- The Ranger is also capable to auto-attack enemies (farming), he can use the "hunters mark" and he uses the supertshots (higher dps) skill on enemies. He also uses Multishot for optimal farming efficiency.
- The priest also can farm on it's own, heal partymembers and heal the whole party at once if needed. He can also debuff (curse) enemies

The individual character modules are still very basic. Farming low-level mob's did not require writing complex code, or even character interaction (beyond healing), so far.

### The merchant

The merchant can sell your loot on the marketplace. You can just drop your loot inside his store, set a price and he'll sell it.

I decided that, because the merchant cannot farm / generate gold on his own, he should act as a support characters for the "productive" characters.

So he takes care of a lot of things for you!

Every 10 minutes, he does a round:

- Close the merchant stand
- Buys potions for all characters
- Walks to the current farming spot
- Delivers the potions to all characters
- Gets all their items...
- ...and all their gold
- Goes back to the market
- Buys scrolls (if needed) to upgrade & compound the items he got from the farming characters
- Exchanges any gems / chests he received
- Deposits all gold above a certain limit in the bank. (Remember, to auto-buy things, he cannot deposit all gold, he needs to keep some)
- Goes back to town and opens up his little stand

Once the stand is open, he continues his work:

- Auto-Upgrade designated items
- Auto-Compound designated items into a higher level item
- Put these higher level items in the stand for sale
- Sell "trash", so your inventory doesn't fill up. You can designate what is considered "trash" depending on what your current enemies drop.
- Tidy the inventory so there are no gaps (from crafting / selling things)
- Give other players the "merchant's luck"-buff, with a chance to duplicate an item from them
- Auto-buy cheap items from other merchants. If they sell an item under it's value, your merchant will buy it automatically.

Other functions

- Auto-exchange : If your merchant has an exchangeable in his inventory, he'll exchange it at Xyn automatically. 

- Auto-exchange seashells: Onye your merchant has 20 seashells in his iventory, he'll go and exchange it for a buff-potion. He then delivers the potion to the appropriate character (e.g. dexterity-potion for ranger) on the next round he does.

- Autocraft: Designate items you want to craft. Farm several, different ingredients with the new multi-monster farming function! As soon as the merchant has all necessary ingredients in his inventory, he'll auto-craft the item for you automatically!

## General functions

There's a  module called "helperFunctions": It holds all functions in one place which are useful to every character (not to waste module-slots). They are quite helpful and take care of a lot of things:

- Hotkeys
- Starting / stopping characters and creating a party
- Handle party-invitations
- Auto-Transfer loot (to the merchant)
- Drink / Relocate potions
- Tidying the inventory (arranging all items, gap-free)
- Following Master, cross-map
- Show status: Nice button with an abundance of information (Activa hunting quests / Farming mode / Master / Map where yor characters are / what monster they're farming / hunting / etc.)

## Adjust the code

I tried to make the code as open as possible. However, you have to change four things in the "Main"-Module, so the code knows *what you want to farm* and *who your characters are (names) *.

Adjust these four variables, and you're good to go:

```javascript
//Name of your merchant
const merchantName = "Hank";
//Name of your characters
const characterNames = ["Freddy", "Frank", "John"];
//Designate a Master for hunting tough monsters
const hunterMaster = characterNames[0];
//Master for hunting tough monsters- Handled by updateFarmingSpot()
let master = "";
//Toggle the pursuit of Hunter Quests
const hunterToggle = true;
//Your characters will cycle through this array of monsters, farming a new monster every few hours!
//Fill in the monsters you want to farm. (Can be one or multiple monsters). IMPORTANT: 24 % allMonstersToFarm.length MUST be 0!!!
const allMonstersToFarm = ["crabx", "bbpompom", "ghost"]; //"porcupine", "porcupine", "croc", "armadillo", "arcticbee", "crabx"
//Monster you are currently farming - Handled by updateFarmingSpot()
let farmMonsterType = scheduleFarming();
//Monsters your characters are allowed to hunt. Only enter monsters you are strong enough to defeat!
const allowedMonsters = [
	"hen", "rooster", "goo", "crab", "bee", "minimush", "frog",
	"squigtoad", "osnake", "snake", "rat", "armadillo", "croc",
	"squig", "poisio", "snowman", "porcupine", "arcticbee",
	"spider", "tortoise", "stoneworm", "bat", "scorpion", "gscorpion",
	"iceroamer", "crabx", "jr", "greenjr", "bbpompom", "",
	"ghost", "", ""];
/*
Monsters that are too strong for a single character are listed below.
Your Master-Character will choose a monster, which the whole party will then attack.
Also: Characters will start using their offensive skills if a monster is on this list
(They don't use offensive skills against weak monsters, conserve MP)
*/
const requiresMaster = [
	"poisio", "scorpion", "gscorpion", "tortoise", "stoneworm",
	"bat", "spider", "iceroamer", "crabx", "jr", "greenjr",
	"bbpompom", "booboo", "prat", "boar", "ghost", "mummy",
	"mole", "wolfie", "wolf", "xscorpion", "bigbird"];
//Items to upgrade
const itemsToUpgrade = [
	"sshield", "staff", "slimestaff", "staffofthedead", "pmace",
	"firebow", "frostbow", "firestaff",
	//Hunter Sets
	"mchat", "mcgloves", "mcpants", "mcarmor", "mcboots",
	"mmhat", "mmgloves", "mmpants", "mmarmor", "mmshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mrnhat", "mrngloves", "mrnpants", "mrnarmor", "mrnboots",
	"merry"];
//Merchant auto-crafts below items if he has the ingredients in his inventory
//Also: If an item is an ingredient for a recipe you list here, it won't get compounded
const itemsToCraft = [
  "ctristone", "firebow", "frostbow","fierygloves", "wingedboots",
  "elixirdex1", "elixirdex2", "elixirint1", "elixirint2", "elixirvit1",
  "elixirvit2", "xbox"];
//Smart-Moveable Object of your farm-location, handled by updateFarmingSpot()
//Farming spots are found in G.maps.main
let farmingSpotData = getFarmingSpot(farmMonsterType, "farmingSpotData");
```


## To do's

- At the moment, I do not have all skills unlocked. Therefor, I have not written code for them yet.
- A ton of other things I don't even know about yet is also not done yet. :)

## Recap

The code can run on it's own several days, if you tweak the values correctly. The merchant's inventory requires attention from time to time, because I don't want to auto-sell good items, so they keep piling up (intentionally). You can tweak that of course, the code is there.

Enjoy!

## More Information

[I blogged about this project in more detail](https://breaksome.tech/adventure-land-tips/)
