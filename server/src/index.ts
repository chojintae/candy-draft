import express from "express";
import bodyParser from 'body-parser';
import { select_a_pick, load_processed_picks_and_drafters, load_selecting_box, create, decide_the_current_turn } from "./routes"

// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.post("/api/create", create);
app.post("/api/load_processed_picks_and_drafters", load_processed_picks_and_drafters);
app.post("/api/load_selecting_box", load_selecting_box);
app.post("/api/select_a_pick", select_a_pick);
app.post("/api/Decide_the_current_turn", decide_the_current_turn);

app.listen(port, () => console.log(`Server listening on ${port}`));