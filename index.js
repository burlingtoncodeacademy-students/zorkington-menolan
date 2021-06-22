const { read } = require("fs");
const readline = require("readline");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

//a player inventory that can be added to, viewed and removed from
let playerInventory = [];
//the player begins at home
let currentLocation = "home";

// Location class constructor
class Location {
  constructor(locName, locDescription, locInventory, unlocked, possibleLoc) {
    this.locName = locName;
    this.locDescription = locDescription;
    this.locInventory = locInventory;
    this.unlocked = unlocked || false;
    this.possibleLoc = possibleLoc;
  }
  //move seems to not be cooperating with the item inventory funcionality
  move(newLoc) {
    if (this.possibleLoc.includes(newLoc)) {
      currentLocation = newLoc;
      return `You are now in the ${currentLocation}. It's ${locLookup[newLoc].locDescription}`;
    } else {
      return `You can't go directly from ${currentLocation} to ${newLoc} `;
    }
  }

  addInv(item) {
    locLookup[currentLocation].locInventory.push(item);
    return `You drop the ${item} on the ground.`;
  }
}
// Item class constructor, mostly working as intended
class Item {
  constructor(name, description, action, takeable, readable) {
    this.name = name;
    this.description = description;
    this.action = action;
    this.takeable = takeable || false;
    this.readable = readable || false;
  }
  //action functions
  take() {
    if (this.takeable) {
      playerInventory.push(this.name);
      return `You picked up ${this.name}`;
    } else {
      return "You can't take that";
    }
  }

  use() {
    if (this.name === "note") {
      return this.action + this.description;
    } else {
      return this.action;
    }
  }

  read() {
    if (this.readable) {
      return this.readable;
    } else {
      return `You can't read a ${this.name}`;
    }
  }
  // drop function not working yet
  drop() {
    if (this.name) {
      const dropped = playerInventory.indexOf(this.name);
      playerInventory.splice(dropped, 1);
      let dropInv = new Location();
      return dropInv.addInv(this.name);
    }
  }
}

//Defining Item objects
let bed = new Item(
  "bed",
  "A not so cozy looking bed",
  "You take a short nap",
  false,
  false
);

let chair = new Item(
  "chair",
  "A simple chair",
  "You take a seat",
  false,
  false
);

let table = new Item(
  "table",
  "A wooden table",
  "What do you need to use a table for?",
  false,
  false
);

let note = new Item(
  "note",
  "Come find me in the woods... don't get lost! ",
  "You read the note, it says: ",
  true,
  "Come find me in the woods... don't get lost! "
);

let ocarina = new Item(
  "ocarina",
  "It looks like a hairdryer with holes",
  "You play a song",
  true,
  "You can't read an ocarina"
);

let shield = new Item(
  "shield",
  "A wooden shield with some strange symbol on it",
  "You hold the shield as if warding off enemies. You look stupid since there's nobody remotely close to you...",
  true,
  "You try to read the symbol on the shield but it's just squiggles to you"
);
//Item objects lookup table
let lookupTable = {
  bed: bed,
  chair: chair,
  table: table,
  note: note,
  ocarina: ocarina,
  shield: shield,
};

//defining location objects
let home = new Location(
  "home",
  "your home, there's a bed, some tables and chairs and other homey stuff. There's also a door leading outside... ",
  [],
  true,
  ["balcony"]
);

let balcony = new Location(
  "balcony",
  "a balcony with a ladder fixed to it. The door to your home is behind you and in the distance you can see a large wooded area with an obvious clearing just past the edge of the trees. There is also a shield lying in the corner...",
  ["shield"],
  true,
  ["home", "clearing"]
);

let clearing = new Location(
  "clearing",
  "a clearing with a path towards a stump in the distance and a meadow in the other direction",
  [],
  true,
  ["balcony", "stump", "meadow"]
);

let stumpRoom = new Location(
  "stump",
  "an open field with two stumps. One is empty and the other has a fairy like creature on it. At it's feet lays a slingshot There is a path leading onwards towards a bridge.",
  ["slingshot"],
  true,
  ["clearing", "bridge"]
);

let bridge = new Location(
  "bridge",
  "a rickety looking bridge crosses a deep chasm. There is another fairy like creature standing at the start of the bridge.",
  [],
  true,
  ["stumpRoom"]
);

let meadow = new Location(
  "meadow",
  "a grassy meadow with a large pond and a tree at it's edge. Above the pond hanging from the tree is a bullseye.",
  [],
  false,
  ["clearing", "pasture"]
);

let pasture = new Location(
  "pasture",
  "a wide open pasture with a castle in the distance",
  [],
  false,
  ["meadow", "castle"]
);

//Lookup table for locations, not working with extra names (stump, woods, etc)
let locLookup = {
  home: home,
  balcony: balcony,
  clearing: clearing,
  woods: clearing,
  stump: stumpRoom,
  stumpRoom: stumpRoom,
  bridge: bridge,
  meadow: meadow,
  pasture: pasture,
  //castle: castle,
};

start();
//A function to start the game
async function start() {
  const welcomeMessage = `You awake from a dream in which you see a young child fleeing a large castle on horseback. She was escorted by a guardian... was she someone important...? The man she was fleeing was strange and had a truly evil look about him. He had olive green skin, glowing amber eyes and deep red hair. But enough about them... this is about YOU. So you wake up from this dream and you appear to be in a tree. Not in a tree-house, inside of a tree! But it's homey... there's a bed, some tables and chairs and other homey stuff. There's also a door leading to a balcony...`;
  console.log(welcomeMessage);
}

//The main funtion to play the game
async function play() {
  let userAction = await ask(`>_`); //prompt that will accept user inputs
  let inputArray = userAction.toLowerCase().split(" ");
  let action = inputArray[0];
  let target = inputArray[1];
  if (action === "take") {
    console.log(lookupTable[target].take());
  } else if (action === "drop") {
    console.log(lookupTable[target].drop());
  } else if (action === "i" || action === "inventory" || action === "I") {
    console.log(`You have:\n ${playerInventory.toString("\n")}`); //the player can check their inventory and it will be printed back to them
  } else if (action === "use") {
    console.log(lookupTable[target].use());
  } else if (action === "read") {
    console.log(lookupTable[target].read()); //
  } else if (action === "move" || action === "go") {
    console.log(locLookup[currentLocation].move(target));
    if (this.unlocked === false) {
      // trying to deny access with locked doors
      return `Your path is blocked`; //not working any way i try
    }
  } else {
    console.log(`You don't know how to ${userAction.split(" ", 1)}`);
  }
  return play();
}

play();
