import React, { ChangeEvent, Component } from "react";
import { MouseEvent } from "react";

// Note. "Props” are public interface, used by clients (i.e., other classes).
// Note. "State" is private choice of data structures, hidden from clients (i.e., other classes).

type MainPageProps = {
    onClick: (_: MouseEvent<HTMLButtonElement>) => void;
};

type MainPageState = {
  drafterName: string
  draftID: number
  list_of_picks: string                 // raw data from users
  list_of_drafters: string              // raw data from users
  list_of_picks_in_array: string[]      // processed; ready to be sent to the server 
  list_of_drafters_in_array: string[]   // processed; ready to be sent to the server
  rounds: number
}


export class MainPage extends Component<MainPageProps, MainPageState> {

  constructor(props: MainPageProps) {
    super(props);
    this.state = {
      drafterName: "",
      draftID: NaN,
      rounds: NaN,
      list_of_picks: "",
      list_of_drafters: "",
      list_of_picks_in_array: [],
      list_of_drafters_in_array: []
    };
  }
  
  // by the way, why do I have both value and onChange? Aren't they doing the same thing?
  render = (): JSX.Element => {
    return (
        <div>
          Drafter: <input type="text" value={this.state.drafterName} onChange={this.drafterNameSet}/>
          <p><b>Join Existing Draft</b></p>
          Draft ID: <input type="number" value={this.state.draftID} onChange={this.draftIDSet}/>
                    <button onClick={() => {this.props.onClick; this.toServer_Join_existing_draft()}}>Join</button> 
          <p><b>Create New Draft</b></p>
          Rounds: <input type="number" value={this.state.rounds} onChange={this.roundsSet}/>
          
          <p>Options (one per line)</p>
          <textarea rows={5} cols={60} value={this.state.list_of_picks}></textarea>
          
          <p>Drafters (one per line, in order)</p>
          <textarea rows={5} cols={60} value={this.state.list_of_drafters}></textarea>
          <button onClick={() => {this.props.onClick; this.toServer_Create()}}>Create</button> 
          </div> 
    )
  };


    // Send the picks/drafters list to the server along with ID
    toServer_Join_existing_draft = (): void => { 
        if (this.state.rounds !== undefined && this.state.list_of_picks_in_array !== undefined && this.state.list_of_drafters_in_array !== undefined) {
            fetch("/api/" + 
            {method: "POST",
            body: JSON.stringify({"drafterName": this.state.drafterName,
                                  "draftID": this.state.draftID})})
            .catch(this.handleServerError);
        }
    }

    // Send the server the picks/drafters list that the user just typed in 
    toServer_Create = (): void => { 
        if (this.state.rounds !== undefined && this.state.list_of_picks_in_array !== undefined && this.state.list_of_drafters_in_array !== undefined) {
            fetch("/api/create" + // not sure if this would work, since I omitted /api/create/ID?= ....
            {method: "POST",
            body: JSON.stringify({"rounds": this.state.rounds,
                                  "list_of_picks_in_array": this.state.list_of_picks_in_array,
                                  "list_of_drafters_in_array": this.state.list_of_drafters_in_array})})
            .catch(this.handleServerError);
        }
    }

  // Called each time the text in the new item name field is changed.
  drafterNameSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({drafterName: evt.target.value})
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
  list_of_picksSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    const picks: string[] = evt.target.value.split("\n")
    this.setState({list_of_picks_in_array: picks})
  }

  // Called each time the text in the new item name field is changed.
  // convert string into the string[]  
  list_of_draftersSet = (evt: ChangeEvent<HTMLInputElement>): void => {
    const drafters: string[] = evt.target.value.split("\n")
    this.setState({list_of_drafters_in_array: drafters})
  }

  handleServerError = (_: Response) => {
    console.log("something bad happened");
  }
}