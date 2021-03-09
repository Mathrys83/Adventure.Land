# Adventure.Land

This is my code for Adventure.Land, an epic indie MMO RPG, where you have to write JavaScript code to fully automate everything that happens.

You can see the game live with [this realtime live-view](https://adventure.land/comm?scale=2)! :)
The officlal website of the game can be found [here](https://adventure.land/).

## What the game is about

The basic idea of the game itself is super appealing: The most forbidden thing in *any* game, is to write a bot for it. *Here, BOTTING IS THE GAME!* :)

![Adventure.Land Farming Party](https://raw.githubusercontent.com/johnnyawesome/Adventure.Land/master/DemoImg/AdventureLandFarming1.gif)

(This is not my first coding game, I also played [Screeps](https://screeps.com/), and you can [check out my source here](https://github.com/johnnyawesome/Screeps)).

## Battletested

This code is simple, but *it works*, I try to make sure of that.

I only publish a new version of my Adventure.Land scripts after they ran flawlessly over several days.

I try to make sure that if you use (some or all of) my code, *it works, and it's stable and reliable*.

There might be an occasional bug, of course, but generally I only publish code that ran stable for several days.

## Getting started

These are two great guides that will give you an overview over the game:

- [Sin's Guide to life in Adventure Land](https://steamcommunity.com/sharedfiles/filedetails/?id=1636142608)
- [FAQ's by Trexnamedtom](https://steamcommunity.com/sharedfiles/filedetails/?id=1640326394)

## Code overview

The game lets you create multiple modules, which I did, to keep things organized.

**Update: Now, the only place where you have to adjust character-names, is in the "Main" module.**

Most code I've seen has one single "main" loop that runs ~250ms, so 4 times per second. This is suggested for optimal farming performance.
My code does have two "main" loops. Running everything every 250 milliseconds might give you great farming-performance, but it's horrible for performance overall. Therefor, I made a "tierTwo" loop that only runs every 5 seconds. All non-essential routines get called from there. This saves a tremendous amount of resources.

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
- Custom Buttons and friendly User Interface for quick access to frequently used functions
![User Interface](https://github.com/johnnyawesome/Adventure.Land/blob/master/DemoImg/UI.jpg)
- Auto-move to the designated farming spot, over several maps / continents.
- Auto-Farm designated monsters
- New: Multi-monster farming! Designate multiple monsters to be farmed. Your characters will then farm several different monsters per day (in addition to their hunting quests).
- Auto-use potions (health & mana)
- Auto-Kite enemies. (All characters I use (Mage, Priest, Ranger) are ranged characters.)
- Two Kiting-Modes (Walk backwards / circle around the target)
- Seashells get exchanged for buff-potions
- Buff-Potions get delivered to the correct characters, which consume them automatically
- Fetch Hunting-Quests
- Go hunting
- Turn in fulfilled Hunting-Quests
- Farming / Hunting small enemies get attacked by individual characters
- Farming / Hunting big enemies get attacked by all characters (All characters target one single enemy)
- Master-Mode (Define a master the other characters follow. Also: Only the master chooses targets. All characters then attack the chosen target. This lets you take on bigger enemies!)

## Individual characters

- The Mage can: Auto-attack enemies (farming), energize partymembers, burst enemies (controlled and uncontrolled), and shield hurt allies from damage
- The Ranger is capable to auto-attack enemies (farming), and he can use the hunters mark to debuff enemies. He also uses Multi-Shot (3-Shot and 5-Shot) for optimal farming efficiency. Also, he can both use the super-shot skill (higher dps), as well as the piercing-shot skill against armored enemies
- The Priest also can farm on it's own, heal individual party-members, asl well as healing the whole party at once, if needed. He can also curse (debuff) enemies, use dark blessing (buff farming-party) and absorb sins (to protect your farming-party)

The individual character modules are still very basic. Farming low-level mob's did not require writing complex code.

### The merchant

The merchant can sell your loot on the marketplace. You can just drop your loot inside his merchant-stand, set a price and he'll sell it.

I decided that, because the merchant cannot farm / generate gold on his own, he should act as a support characters for the "productive" characters.

So he takes care of a lot of things for you!

Every 10 minutes, the merchant does his round and fulfills a lot of automated tasks:

- Close the merchant stand
- Buy potions for all characters
- Walk to the current farming spot
- Deliver the potions to all characters
- Get all the other character's items...
- ...and all their gold
- Go back to the market
- Buy scrolls (if needed) to upgrade & compound the items the merchant got from the farming characters
- Exchange any gems / chests he received
- Deposit all gold above a certain limit in the bank. (Remember, to auto-buy things, the merchant cannot deposit all gold, he needs to keep some)
- Deposit designated items at the bank (Auto-Store high-level / rare items, and items of your choosing)
- Go back to town and open up his little merchant-stand

Once the stand is open, the merchant continues his work:

- Auto-Upgrade designated items into a higher level item
- Auto-Compound several designated items at once into a higher level item
- Put these higher level items on the merchant-stand for sale (if needed)
- NEW: Auto-Dismantle designated items to get crafting-materials
- Sell "trash", so your inventory doesn't fill up. You can choose what items are considered "trash". This "trash" will be auto-sold to keep your inventory free
- Tidy the inventory so there are no gaps (from crafting / selling things)
- Give other players the "merchant's luck"-buff, with a chance to duplicate a free item from them
- Auto-buy cheap items from other merchants. If they sell an item under it's value, your merchant will buy it automatically. Sneaky!
- Auto-Join giveaways: Automatically partake when a player hosts a giveaway - Merry christmas!

Other functions

- Auto-exchange: If your merchant has an exchangeable in his inventory, he'll exchange it at Xyn automatically. 

- Auto-exchange seashells: When your merchant has 20 seashells in his inventory, he'll go to the fisherman and exchange it for a buff-potion. He then delivers the potion to the appropriate character (e.g. dexterity-potion for ranger) on the next round he does.

- Autocraft: Designate items you want to craft. Farm several, different ingredients with the new multi-monster farming function! As soon as the merchant has all necessary ingredients in his inventory, he'll auto-craft the item for you automatically!

- Auto-Dismantle: Dismantle items of your choosing to get rare crafting-materials

## Code Messages (CM's)

- If a character runs out of healtp-potions, it will ask party-members to pass some health-potions
- Party-members will send the potions to the requesting character, if they are in range.

I didn't do much with CM's yet, but the modules to create ("sendCodeMessages") and handle ("handleCodeMessages") CM's are in place and ready to use.

## General functions

There's a  module called "helperFunctions": It holds all functions in one place which are useful to every character (not to waste module-slots). They are quite helpful and take care of a lot of things:

- Hotkeys
- Starting / stopping characters and creating a party
- Handle party-invitations
- Auto-Transfer loot (to the merchant)
- Drink / Relocate potions
- Tidying the inventory (arranging all items, gap-free)
- Following the  Master, cross-map and cross-continent
- Show status: Nice button with an abundance of information (Active hunting quests / Farming mode / Master / Map where yor characters are / What monster they're farming / hunting / etc.)

## Adjust the code

I tried to make the code as open as possible. However, you have to change a few variables in the "Main"-Module, so the code knows *what you want to farm* and *who your characters are (names) * etc.

Adjust these variables, and you're good to go:

```javascript
/*
###################################################################

######################### Custom Settings ##########################

					Adjust below values to your needs

###################################################################
*/

//Name of your merchant
const merchantName = "TheGoldenOne";
//Name of your characters
const characterNames = ["Paul", "MacicMage", "RobinRanger"];
//Designate a Master for hunting tough monsters
const hunterMaster = characterNames[0];
//Master for hunting tough monsters- Handled by updateFarmingSpot()
let master = "";
//Toggle the pursuit of Hunter Quests
const hunterToggle = true;
//Your characters will cycle through this array of monsters, farming a new monster every few hours!
//Fill in the monsters you want to farm. (Can be one or multiple monsters). IMPORTANT: 24 % allMonstersToFarm.length MUST be 0!!!
const allMonstersToFarm = ["rat", "crabx", "bbpompom", "ghost"];
//Monster you are currently farming - Handled by updateFarmingSpot()
let farmMonsterType = scheduleFarming();
//Monsters your characters are allowed to hunt. Only enter monsters you are strong enough to defeat!
const allowedMonsters = [
	"hen", "rooster", "goo", "crab", "bee", "minimush", "frog",
	"squigtoad", "osnake", "snake", "rat", "armadillo", "croc",
	"squig", "poisio", "snowman", "porcupine", "arcticbee",
	"spider", "tortoise", "bat", "scorpion", "gscorpion",
	"iceroamer", "crabx", "jr", "greenjr", "bbpompom", "ghost",
	"xscorpion"];
/*
Monsters that are too strong for a single character are listed below.
Your Master-Character will choose a monster, which the whole party will then attack.
Also: Characters will start using their offensive skills if a monster is on this list
(They don't use offensive skills against weak monsters, to conserve MP)
*/
const requiresMaster = [
	"poisio", "scorpion", "gscorpion", "tortoise", "stoneworm",
	"bat", "spider", "iceroamer", "crabx", "jr", "greenjr",
	"bbpompom", "booboo", "prat", "boar", "ghost", "mummy",
	"mole", "wolfie", "wolf", "xscorpion", "bigbird"];
//Items to upgrade
//Items on this list get auto-upgraded
const itemsToUpgrade = [
	"sshield", "staff", "slimestaff", "staffofthedead", "maceofthedead", "pmace",
	"firebow", "frostbow", "firestaff", "t2bow", "gphelmet", "xmassweater",
	"cape", "bcape", "", "", "",
	//Hunter Sets
	"mchat", "mcgloves", "mcpants", "mcarmor", "mcboots",
	"mmhat", "mmgloves", "mmpants", "mmarmor", "mmshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mphat", "mpgloves", "mppants", "mparmor", "mpshoes",
	"mrnhat", "mrngloves", "mrnpants", "mrnarmor", "mrnboots",
	"", "", "", "", "",
	"", "", "", "", "",
	"merry"];
//The merchant auto-crafts below listed items if he has the ingredients in his inventory
//Also: If an item is an ingredient for a recipe you list here, it won't get compounded
const itemsToCraft = ["ctristone", "firebow", "frostbow", "fierygloves", "wingedboots", "elixirdex1", "elixirdex2", "elixirint1", "elixirint2", "elixirvit1", "elixirvit2", "xbox"];
//Items to be dismantled are listed below
//Auto-dismantle items to get rare crafting-materials
const itemsToDismantle = ["fireblade", "daggerofthedead", "swordofthedead", "spearofthedead"];
//Smart-Moveable Object of your farm-location, handled by updateFarmingSpot()
//Farming spots are found in G.maps.main
let farmingSpotData = getFarmingSpot(farmMonsterType, "farmingSpotData");
```


## To do's

- A ton of things I don't even know about yet... It's a learning experience! :)

## Recap

The code can run on it's own over several days / weeks, if you tweak the values correctly. The merchant's inventory / Bank slots require attention from time to time. This is because I don't want to auto-sell good items, so they keep piling up (intentionally). You can tweak that of course, all the code is there. 

Enjoy!

## More Information

[I blogged about this project in more detail](https://breaksome.tech/adventure-land-tips/)
