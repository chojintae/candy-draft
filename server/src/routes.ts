import { Request, Response } from "express";

let the_largest_ID_as_of_now: number = 0

// Description of an individual draft
type Not_yet_processed = {
  rounds: number
  picks: Map<string, string> // this is a map because it is easier to locate an element with the name
  drafters: string[]
  current_turn_index: number
  current_turn_index_max: number
  completed: boolean
};

type Processed = {
  picks_and_drafters: [string, string][]
}

// The storages of data. Map from the ID to the draft.
const Not_yet_processed: Map<number, Not_yet_processed> = new Map(); // its element should not be deleted since we need a list of drafters at select_a_pick().
const Processed: Map<number, Processed> = new Map();

// receive rounds/lists from the client and store them in the server, specifically to "Not_yet_processed"
// And then return back the ID to the server.
// Also, return back the very first drafter.
export function create(req: Request, res: Response) {
  
  // A list of picks and a list of drafters will come in.
  // We create a draft as a result. 
  const rounds:number = req.body.rounds
  const list_of_picks_in_array:string[] = req.body.list_of_picks_in_array
  const list_of_drafters_in_array:string[] = req.body.list_of_drafters_in_array

  if (rounds === undefined) {
    res.status(400).send("No rounds received")
    return;
  }

  if (list_of_picks_in_array === undefined) {
    res.status(400).send("No list_of_picks_in_array received")
    return;
  }

  if (list_of_drafters_in_array === undefined) {
    res.status(400).send("No list_of_drafters_in_array received")
    return;
  }


  the_largest_ID_as_of_now = the_largest_ID_as_of_now + 1
  const ID_for_this_draft:number = the_largest_ID_as_of_now  

  // We need this for current_turn_index
  const drafters_number: number = list_of_drafters_in_array.length

  // We need this for the error checking below
  const picks_number: number = list_of_picks_in_array.length

  // check if rounds * 2 is greater than the number of drafters.
  if (rounds * drafters_number > picks_number) {
    res.json({wrong_rounds: true})
    return;
  }

  // need to convert the array picks into map picks.
  let list_of_picks_in_map:Map<string, string> = new Map()
  for (let i = 0; i < picks_number; i ++) {
    const pick = list_of_picks_in_array[i]
    if (pick !== undefined)
    list_of_picks_in_map.set(pick, pick)
  }
  
  const not_yet_processed : Not_yet_processed = { 
    rounds: rounds,
    picks: list_of_picks_in_map,
    drafters: list_of_drafters_in_array,
    current_turn_index: 0,
    current_turn_index_max: drafters_number - 1,
    completed: false
  };

  Not_yet_processed.set(ID_for_this_draft, not_yet_processed)

  // return back the very first drafter as "current_turn".
  res.json({draftID: ID_for_this_draft})
}

// receive the ID and send to the client the current turn
// also, send the fact that whether the draft is completed or not
export function decide_the_current_turn(req: Request, res: Response) {
  const draftID = req.body.draftID

  const key = Not_yet_processed.get(draftID)

  if (key === undefined) {
    res.status(400).send("No such thing exists")
    return;
  } 
  
  if (key.picks === undefined) {
    res.status(400).send("No such pick exists")
    return;
  }

  const key_of_Not_yet_processed = Not_yet_processed.get(draftID)

  if (key_of_Not_yet_processed === undefined) {
    res.status(400).send("No such thing exists")
    return;
  } 

  // send the current_turn drafter name
  // Also, send whether the draft is completed.
  if (key.picks.size === 0 || key.rounds === 0) { 
    key_of_Not_yet_processed.completed = true
    res.json({current_turn: key.drafters[(key.current_turn_index)],
    completed: key_of_Not_yet_processed.completed})
  } else {
    key_of_Not_yet_processed.completed = false 
    res.json({current_turn: key.drafters[(key.current_turn_index)],
    completed: key_of_Not_yet_processed.completed})
  } 
}

// receive the ID and send to the client the processed_picks_and_drafters
export function load_processed_picks_and_drafters(req: Request, res: Response) {
  const draftID = req.body.draftID

  // below if statements are nothing but just checkings. Not significant
  if (draftID > the_largest_ID_as_of_now) {
    res.status(400).send("No such ID exists")
    return;
  } 

  // The server sentds back the processed_picks_and_drafters only when there is processed_picks_and_drafters.
  if (Processed === undefined) {
    res.json({ processed_picks_and_drafters: [["", ""]] })

  } else {
    const key = Processed.get(draftID)

    if (key === undefined) {
      //res.status(400).send("There is no processed storages of the given ID")
      res.json({ processed_picks_and_drafters: [["", ""]] })
      return;
    }

    res.json({ processed_picks_and_drafters: key.picks_and_drafters })// which is the type of type Processed = { picks_and_drafters: [string, string][] }
  }
}

// receive the ID and send to the client the not_yet_processed picks
export function load_selecting_box(req: Request, res: Response) {
  const draftID = req.body.draftID

  if (draftID > the_largest_ID_as_of_now) {
    res.status(400).send("No such ID exists")
    return;
  } 

  if (Not_yet_processed === undefined) {
    res.status(400).send("There is no not_yet_processed storages")
    return;
  }


  const key = Not_yet_processed.get(draftID)
  if (key === undefined) {
    res.status(400).send("There is no not_yet_processed storages of the given ID")
    return;
  }

  
  // covert the map form into the array form
  const unprocessed_picks_in_map:Map<string, string> = key.picks
  let unprocessed_picks_in_array:Array<string> = Array.from(unprocessed_picks_in_map.keys())

  //res.status(200).send("'unprocessed_picks_in_array' sent to the client successfully")
  res.status(200).json({ not_yet_processed_picks: unprocessed_picks_in_array })
}

// eliminate a pick from "not_yet_processed" of a particular ID.
// this function will be activated when a pick is selected. 
// it send to the client the current drafter.
// Also, this function update the storages here.
// it will receive both the ID and the selected pick.
// Also, change the current_turn_index.
// Moreover, if there is no pick anymore, notify that the draft is completed.
// Also, assign the pick with the user, and put them as a pair in [string, string][].
export function select_a_pick(req: Request, res: Response) {
  const draftID = req.body.draftID
  const selected_pick = req.body.selected_pick
  const userName = req.body.userName 

  // below if statements are nothing but just checkings. Not significant
  if (draftID === undefined) {
    res.status(400).send("draftID wasn't provided")
    return;
  }

  if (selected_pick === undefined) {
    res.status(400).send("selected_pick wasn't provided")
    return;
  }

  if (typeof selected_pick !== 'string') {
    res.status(400).send("selected_pick isn't string")
    return;
  }

  if (userName === undefined) {
    res.status(400).send("userName wasn't provided")
    return;
  }

  if (typeof userName !== 'string') {
    res.status(400).send("userName isn't string")
    return;
  }

  if (draftID > the_largest_ID_as_of_now) {
    res.status(400).send("No such ID exists")
    return;
  } 

  if (Not_yet_processed === undefined) {
    res.status(400).send("No such thing exists")
    return;
  }

  const key = Not_yet_processed.get(draftID)
  if (key === undefined) {
    res.status(400).send("No such thing exists")
    return;
  } 

  if (key.picks === undefined) {
    res.status(400).send("No such pick exists")
    return;
  }
  
  const selected_pick_and_drafter: Processed = {
    picks_and_drafters: [[selected_pick, userName]]
  }

  if (Processed.has(draftID)) {
    //get, insert, and put it back
    const get_the_existing_picks_and_drafters = Processed.get(draftID) // get
    if (get_the_existing_picks_and_drafters !== undefined) { // just undefined checking
      get_the_existing_picks_and_drafters.picks_and_drafters.push([selected_pick, userName]) // insert
      Processed.set(draftID, get_the_existing_picks_and_drafters) // and put it back
    }
  } else {
    Processed.set(draftID, selected_pick_and_drafter)
  }

  // And then, push the selected_pick_and_drafter to the [string, string][]

  key.picks.delete(selected_pick)

  // change the current_turn_index. Also, this is the time when the round should decrement.
  if (key.current_turn_index + 1 > key.current_turn_index_max) {
    key.current_turn_index = 0
    key.rounds = key.rounds - 1
  } else {
    key.current_turn_index = key.current_turn_index + 1
  }

  const key_of_Not_yet_processed = Not_yet_processed.get(draftID)

  if (key_of_Not_yet_processed === undefined) {
    res.status(400).send("No such thing exists")
    return;
  } 

  // send the current_turn drafter name
  // Also, send whether the draft is completed.
  if (key.picks.size === 0 || key.rounds === 0) { 
    key_of_Not_yet_processed.completed = true
    res.json({current_turn: key.drafters[(key.current_turn_index)],
    completed: key_of_Not_yet_processed.completed})
  } else {
    key_of_Not_yet_processed.completed = false 
    res.json({current_turn: key.drafters[(key.current_turn_index)],
    completed: key_of_Not_yet_processed.completed})
  } 
}

// This function exists solely for the tests.
export function empty_everything() {
  the_largest_ID_as_of_now = 0
  Not_yet_processed.clear()
  Processed.clear()
}