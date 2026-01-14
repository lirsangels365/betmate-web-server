/**
 * @file TypeScript interfaces for the 365scores Games API response structure
 */

/**
 * Main response object from the 365scores Games API
 */
export interface ExternalGameApiResponse {
  LastUpdateID: number;
  Countries: Country[];
  Games: ExternalGame[];
  Competitions: ExternalCompetition[];
  Bookmakers: unknown[]; // Empty in provided sample
  CurrentDate: string;
  CurrentTimeUTC: string;
  TTL: number;
  ScrollIndex: number;
  Summary: Summary;
}

/**
 * Country information
 */
export interface Country {
  Name: string;
  NameForURL: string;
  ID: number;
  DefaultLang: number;
  GamesCount?: number;
  LiveCount?: number;
  DefaultLanguage: number;
  Color?: string;
  Color2?: string;
  ImgVer: number;
  NotReal?: boolean;
  IsInternational?: boolean;
  FatherCountryId?: number;
}

/**
 * Game object from the external API
 * Note: In this API, 'Comps' refers to the teams/competitors
 */
export interface ExternalGame {
  SID: number;
  ID: number;
  Comp: number;
  Season: number;
  Stage: number;
  Group?: number;
  Active: boolean;
  NotPlaying?: boolean;
  STID: number;
  StatusSequence: number;
  GT: number;
  PreciseGT: number;
  AutoProgressGT: boolean;
  Completion: number;
  RegularTimeCompletion: number;
  GTD: string;
  STime: string;
  ETime: string;
  Countdown?: number;
  ShowCountdown?: boolean;
  Comps: Competitor[]; // Note: In this API, 'Comps' refers to the teams/competitors
  Scrs: number[];
  Round?: number;
  RoundName?: string;
  OnTV: boolean;
  HasBets: boolean;
  Winner: number;
  IsFinished: boolean;
  Venue?: Venue;
  SocialStats: {
    Comments: number;
  };
  WhoWillWinReults?: {
    Vote1: number;
    VoteX: number;
    Vote2: number;
  };
  WebUrl: string;
  LineupsStatus?: number;
  LineupsStatusText?: string;
  HasTopPerformers?: boolean;
  HasPlayByPlay?: boolean;
}

/**
 * Competitor (team/player) information
 */
export interface Competitor {
  ID: number;
  Name: string;
  SymbolicName?: string;
  NameForURL: string;
  CID: number;
  SID: number;
  Color: string;
  TextColor: string;
  MainComp: number;
  CompetitionHasTexture: boolean;
  Trend?: number[];
  Type: number;
  PopularityRank: number;
  ImgVer: number;
  Founded?: string;
  HasSquad?: boolean;
}

/**
 * Venue information
 */
export interface Venue {
  ID: number;
  Name: string;
  SName: string;
}

/**
 * Competition information
 */
export interface ExternalCompetition {
  Name: string;
  SName?: string;
  NameForURL: string;
  ID: number;
  CID: number;
  SID: number;
  HasTbl?: boolean;
  HasLiveTable?: boolean;
  OrderLevel: number;
  CurrSeason?: number;
  CurrSeasonName?: string;
  Gender: number;
  Color?: string;
  Color2?: string;
  TextColor?: string;
  ImgVer: number;
  PopularityRank: number;
}

/**
 * Summary information for the date range
 */
export interface Summary {
  RangeStart: string;
  RangeEnd: string;
  Dates: {
    Date: string;
    Count: number;
  }[];
}
