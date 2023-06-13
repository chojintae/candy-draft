import React, { ChangeEvent, Component } from "react";
import { Draft } from './draft'

interface AppState {
  current_page_is_main: boolean

  userName: string
  draftID: number
  list_of_picks: string                 // raw data from users
  list_of_drafters: string              // raw data from users
  list_of_picks_in_array: string[]      // processed; ready to be sent to the server 
  list_of_drafters_in_array: string[]   // processed; ready to be sent to the server
  rounds: number
}

export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      current_page_is_main: true,

      userName: "",
      draftID: NaN,
      rounds: NaN,
      list_of_picks: "",
      list_of_drafters: "",
      list_of_picks_in_array: [],
      list_of_drafters_in_array: []
    };
  }
  
  render = (): JSX.Element => {
      if (this.state.current_page_is_main === true) {
        return (
          <div>
          Drafter: <input type="text" onChange={this.userNameSet}/>
          <p><b>Join Existing Draft</b></p>
          Draft ID: <input type="number" onChange={this.draftIDSet}/>
                    <button type="button" onClick={this.reverseCurrent_page_is_main}>Join</button> 
          <p><b>Create New Draft</b></p>
          Rounds: <input type="number" onChange={this.roundsSet}/>
          
          <p>Options (one per line)</p>
          <form><textarea placeholder="Write the picks..." rows={25} cols={18} onChange={this.list_of_picksSet}></textarea></form>
          
          <p>Drafters (one per line, in order)</p>
          <textarea  placeholder="Write the drafters..." rows={25} cols={18} onChange={this.list_of_draftersSet}></textarea>
          <button onClick={this.toServer_Create}>Create</button> 
          </div> 
        )
      } else {
        return <Draft userName={this.state.userName} draftID={this.state.draftID} onClick={this.reverseCurrent_page_is_main}/>
        
      }
  };

  // This function sends the server the picks/drafters list that the user just typed in.
  // And it will fetch the newly-generated ID.
  // Also, alert if too big rounds are put.
  toServer_Create = (): void => { 

    // to begin with, move on to the draft page
    this.reverseCurrent_page_is_main()
    
    if (this.state.rounds !== undefined && this.state.list_of_picks_in_array !== undefined && this.state.list_of_drafters_in_array !== undefined) {
        fetch("/api/create",
          {method: "POST",
           body: JSON.stringify({"rounds": this.state.rounds,
                                "list_of_picks_in_array": this.state.list_of_picks_in_array,
                                "list_of_drafters_in_array": this.state.list_of_drafters_in_array}),
                                 headers: {"Content-Type": "application/json"}
                              })
          .then(this.handleServer_create_Response)
          .catch(this.handleServerError);
      }
  }

  handleServer_create_Response = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleServer_createJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleServer_createJson = (vals: any) => { 
    if (vals.wrong_rounds === true) {
      alert("Invalid rounds number. Go back and retry.")
      return;
    }

    if (typeof vals !== "object" || vals === null || typeof vals.draftID !== 'number') {
      console.error("bad data", vals.draftID)
      return;
    }

    this.setState({draftID: vals.draftID})
  }

  // Called each time the text in the new item name field is changed.
  userNameSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({userName: evt.target.value})
  }

  // Called each time the text in the new item name field is changed.
  draftIDSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({draftID: evt.target.valueAsNumber})
  }

  // Called each time the text in the new item name field is changed.
  roundsSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({rounds: evt.target.valueAsNumber})
  }

  // Called each time the text in the new item name field is changed.
  // convert string into the string[]  
  list_of_picksSet = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    const picks: string[] = evt.target.value.split("\n")
    this.setState({list_of_picks_in_array: picks})
  }

  // Called each time the text in the new item name field is changed.
  // convert string into the string[]  
  list_of_draftersSet = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    const drafters: string[] = evt.target.value.split("\n")
    this.setState({list_of_drafters_in_array: drafters})
  }

  // flip the "current_page_is_main" variable
  reverseCurrent_page_is_main = (): void => {
    if (this.state.current_page_is_main === true) this.setState({current_page_is_main: false})
    else this.setState({current_page_is_main: true})
  }

  // only triggers when a server has a trouble
  handleServerError = (_: Response) => {
    console.log("something bad happened");
  }
}