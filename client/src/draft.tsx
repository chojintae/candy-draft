import React, { ChangeEvent, Component } from "react";
import { MouseEvent } from "react";

type DraftProps = {
    draftID: number
    userName: string // the user can be either a participant or a spectator
    onClick: (_: MouseEvent<HTMLButtonElement>) => void;
  };

type DraftState = {
    processed_picks_and_drafters: [string, string][]
    not_yet_processed_picks: string[] // this one is needed for the selecting box
    current_turn: string
    selected_pick: string
    completed: boolean
}


export class Draft extends Component<DraftProps, DraftState> {

  constructor(props: any) {
    super(props);
    this.state = {
        processed_picks_and_drafters:[],
        not_yet_processed_picks: [],
        current_turn: "Nobody", // I know this is a nasty way... but current_turn and seleced_pick should be initialized with different values
        selected_pick: "",
        completed: false
    };
  }

  render = (): JSX.Element => {

    // Ready for displaying a processed list
    const processed_list: JSX.Element[] = [
      <tr>
      <th>Num</th>
      <th>Pick</th>
      <th>Drafter</th>
      </tr>
    ]

    for (let i = 0; i < this.state.processed_picks_and_drafters.length; i ++) {
      processed_list.push(
        <tr>
        <td>{i+1}</td>
        <td>{this.state.processed_picks_and_drafters[i]?.[0]} </td>
        <td>{this.state.processed_picks_and_drafters[i]?.[1]} </td>
      </tr>
      )
    }

    // Ready for displaying a selection
    const available_picks: JSX.Element[] = [
        <option value="TBD">Your Choice</option>
    ];
    for (let i = 0; i < this.state.not_yet_processed_picks.length; i++) {
        available_picks.push(<option value={this.state.not_yet_processed_picks[i]}>{this.state.not_yet_processed_picks[i]}</option>)
    }

    // if it is a completed draft
    if (this.state.completed === true) {
      return (
        <div>
              <b>Current Draft ID:</b> {this.props.draftID}
              <table>
              {processed_list}
              </table>
              <button onClick={() => {
                              this.handleDecide_the_current_turn();
                              this.handleLoad_processed_picks_and_drafters();
                              this.handleLoad_for_selecting_box();}}>Refresh</button>
              <p>The draft has been completed.</p>
              <button onClick={this.props.onClick}>Back</button>
          </div>
      )
    } else { // or, if it is not a completed draft....
      if (this.props.userName === this.state.current_turn) { // if it is the drafter's turn
        return (
            <div>
            <b>Current Draft ID:</b> {this.props.draftID}
            <table>
            {processed_list}
            </table>
            <p>It's your pick, {this.state.current_turn}!</p>
            <button onClick={() => {
                            this.handleDecide_the_current_turn();
                            this.handleLoad_processed_picks_and_drafters();
                            this.handleLoad_for_selecting_box();}}>Refresh</button>
            <select onChange={this.handleA_pick_is_selected}>{available_picks}</select>
            <button onClick={this.props.onClick}>Back</button>
            </div>
        )
      } else { // if it is not the drafter's turn
        if (this.state.current_turn === "Nobody") {
          return (
            <div>
            <b>Current Draft ID:</b> {this.props.draftID}
            <table>
            {processed_list}
            </table>
            click the refresh button.
            <button onClick={()=> {
                            this.handleDecide_the_current_turn();
                            this.handleLoad_processed_picks_and_drafters();
                            this.handleLoad_for_selecting_box();} }>Refresh</button>
            <button onClick={this.props.onClick}>Back</button>
            </div>
          ) 
        } else {
          return (
            <div>
            <b>Current Draft ID:</b> {this.props.draftID}
            <table>
            {processed_list}
            </table>
            It is {this.state.current_turn}'s turn.

            <button onClick={()=> {
                            this.handleDecide_the_current_turn();
                            this.handleLoad_processed_picks_and_drafters();
                            this.handleLoad_for_selecting_box();} }>Refresh</button>
            <button onClick={this.props.onClick}>Back</button>
            </div>
          )
        }
      }
    }
  };

  // send draftID to the server, and get the current_turn 
  // Also, get the fact that whether the draft is completed or not
  handleDecide_the_current_turn = () : void => {
    fetch("/api/Decide_the_current_turn",
          {method: "POST",
          body: JSON.stringify({"draftID": this.props.draftID}),
          headers: {"Content-Type": "application/json"}
          })
          .then(this.handleDecide_the_current_turnResponse)
          .catch(this.handleServerError)
  }

  handleDecide_the_current_turnResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleDecide_the_current_turnJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleDecide_the_current_turnJson = (vals: any) => {
    if (typeof vals !== "object" || vals === null || typeof vals.current_turn !== 'string') {
      console.error("bad data", vals.current_turn)
      return;
    }

    if(typeof vals.completed !== 'boolean') {
      console.error("bad data", vals.completed)
      return;     
    }

    if (vals.completed === false) {
      this.setState({current_turn: vals.current_turn}) 
    } else {
      this.setState({current_turn: vals.current_turn,
                     completed: true}) 
    }
  }


  // bring the picks-drafter pair from the server.
  // use POST to send the ID.
  handleLoad_processed_picks_and_drafters = (): void => {
    fetch("/api/load_processed_picks_and_drafters", 
        {method: "POST",
        body: JSON.stringify({"draftID": this.props.draftID}),
        headers: {"Content-Type": "application/json"}
        })
    .then(this.handleLoad_processed_picks_and_draftersResponse)
    .catch(this.handleServerError)
  }

  handleLoad_processed_picks_and_draftersResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleLoad_processed_picks_and_drafterJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleLoad_processed_picks_and_drafterJson = (vals: any) => { 
    if (typeof vals !== "object" || vals === null || !Array.isArray(vals.processed_picks_and_drafters)) {
        console.error("bad data", vals.processed_picks_and_drafters)
        return;
    }
    this.setState({processed_picks_and_drafters: vals.processed_picks_and_drafters}) 
  }


  // bring the avilable picks for the selecting box from the server.
  // use POST to send the ID.
  handleLoad_for_selecting_box = (): void => {
    fetch("/api/load_selecting_box", 
        {method: "POST",
        body: JSON.stringify({"draftID": this.props.draftID}),
        headers: {"Content-Type": "application/json"}
        })
    .then(this.handleLoad_selecting_boxResponse)
    .catch(this.handleServerError)
  }

  handleLoad_selecting_boxResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleLoad_selecting_boxJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleLoad_selecting_boxJson = (vals: any) => {
    if (typeof vals !== "object" || vals === null || !Array.isArray(vals.not_yet_processed_picks)) {
        console.error("bad data", vals.not_yet_processed_picks)
        return;
    }
    this.setState({not_yet_processed_picks: vals.not_yet_processed_picks}) 
  }


  // tell the server that a pick is selected.
  handleA_pick_is_selected = (evt: ChangeEvent<HTMLSelectElement>): void => {
    if (evt.target.value !== "TBD") {
      this.setState({selected_pick: evt.target.value}) // Note on setState. It takes another render for the state to be set.
    }

    fetch("/api/select_a_pick", 
    {method: "POST",
    body: JSON.stringify({"draftID": this.props.draftID,
                          "selected_pick": evt.target.value,
                          "userName": this.props.userName}), // or, "currnet_turn" would be better?
                          headers: {"Content-Type": "application/json"}})
    .then(this.handleA_pick_is_selectedResponse)
    .catch(this.handleServerError)

  };

  handleA_pick_is_selectedResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleA_pick_is_selectedJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  // set the current turn.
  handleA_pick_is_selectedJson = (vals: any) => {
    if (typeof vals !== "object" || vals === null) {
      console.error("bad data", vals.not_yet_processed_picks)
      return;
    } 
    
    if(typeof vals.completed !== 'boolean') {
      console.error("bad data", vals.completed)
      return;     
    }

    if (vals.completed === false) {
      this.setState({current_turn: vals.current_turn}) 
    } else {
      this.setState({current_turn: vals.current_turn,
                     completed: true}) 
    }
  }

  handleServerError = (_: Response) => {
    console.log("something bad happened");
  }
}