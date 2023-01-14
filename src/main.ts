import * as dotenv from "../node_modules/dotenv"
import { LastFmDataGrabber } from "./lastfm-data-grabber/main";

dotenv.config(); 

function sayMyName(name: string): void {
  const lfm = new LastFmDataGrabber;
  lfm.main();
}
sayMyName("Heisenberg");