# Adventure.Land

This is my code for Adventure.Land, an epic indie MMO RPG, where you have to write JavaScript code to fully automate everything that happens. You can check out [Adventure.Land here.](https://adventure.land/) This is the [Youtube Trailer of the game](
https://www.youtube.com/watch?v=HJAj9u2TEZc).

The basic idea of the game itself is super appealing: The most forbidden thing in *any* game is to write a bot for it. *Here, BOTTING IS THE GAME!* :)

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

Also, many players hardcode their character's names everywhere in the game. I tried to avoid that as much as possible, so I don't have to touch many places in the code when starting a new character.

**Update: Now, the only place where you have to adjust character-names, is in the "Main" module.**

Most code I've seen has one single"main" loop that runs ~250ms, so 4 times per second. This is suggested for optimal farming performance. My code does have two "main" loops. Running everything every 250 milliseconds might give you great farming-performance, but it's horrible for performance overall. Therefor, I made a "tierTwo" loop that only runs every 3 seconds. All non-essential routines get called from there.

## The Characters

You can use four characters at the same time, I opted for:

- Mage
- Priest
- Ranger
- Merchant

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
- Buys scrolls (if needed) to upgrade the items he got from the farming characters
- Exchanges any gems / chests he received
- Deposits all gold above a certain limit in the bank. (Remember, to auto-buy things, he cannot deposit all gold, he needs to keep some)
- Goes back to town and opens up his little stand

Once the stand is open, he continues his work:

- Auto-compound multiple items into a higher level item
- Put these higher level items in the stand for sale
- Sell "trash", so your inventory doesn't fill up. You can designate what is considered "trash" depending on what your current enemies drop.
- Tidy the inventory so there are no gaps (from crafting / selling things)
- Give other players the "merchant's luck"-buff, with a chance to duplicate an item from them
- Auto-buy cheap items from other merchants. If they sell an item under it's value, your merchant will buy it automatically.

Other functions

- Auto-exchange: Onye your merchant has 20 seashells in his iventory, he'll go and exchange it for a buff-potion. He then delivers the potion to the appropriate character (e.g. dexterity-potion for ranger) on the next round he does.

- Autocraft: Designate items you want to craft. Farm several, different ingredients with the new multi-monster farming function! As soon as the merchant has all necessary items in his inventory, he'll craft the item for you automatically!

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
const merchantName = "Your-Merchants-Name";
const characterNames = ["Character-Name1", "Character-Name2", "Character-Name3"];
let master = characterNames[0];
let hunterMaster = characterNames[0];
const hunterToggle = true;
let farmMonsterType = "Monster-To-Farm";
let farmMonsterFallback = "Monster-To-Farm";
```

- "merchantName" - The name of your merchant, as a string. It's used to transfer the farming-party's loot / gold to the merchant etc.
- "characterNames" - Fill in the names of your three remaining characters
- "master" - One characte rmust act as a master when hunting big enemies. Put your tank-character's name here (or reference the characterNames-array) 
- "hunterMaster" - One characte rmust act as a master when hunting big enemies. Put your tank-character's name here (or reference the characterNames-array) 
- "hunterToggle" - Toggle hunting quests on or off. If you set this to false, normal farming will happen, indefinitely
- "farmMonsterType" - The monster you want to farm
- farmMonsterFallback - Fallback monster type, in case all hunting quests are too hard.


## To do's

- At the moment, I do not have all skills unlocked. Therefor, I have not written code for them yet.
- The npc's I farm mostly don't drop weapons or armor. So upgrading is not implemented yet.
- A ton of other things I don't even know about yet is also not done yet. :)

## Recap

The code can run on it's own several days, if you tweak the values correctly. The merchant's inventory requires attention from time to time, because I don't want to auto-sell good items, so they keep piling up (intentionally). You can tweak that of course, the code is there.

Enjoy!

## More Information

[I blogged about this project in more detail](https://breaksome.tech/adventure-land-tips/)
