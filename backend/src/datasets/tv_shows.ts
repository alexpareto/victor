import fs from "fs";
import { cwd } from "process";

export interface TVShows {
  transcript: string;
  show: string;
  season: string;
  episode: string;
  title: string;
  SOURCE: string;
}

export const showsTypeString = `{transcript: string, show: string, season: string, episode: string, title: string, SOURCE: string}[]`;

export const showsJsonFilePath = cwd() + "/src/datasets/tv_dialog.json";
