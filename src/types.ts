export interface GameSearchResult {
  title: string;
  url: string;
}

export interface GameStats {
  title: string;
  platinumPercentage?: number;
  difficulty?: string;
  estimatedTime?: string;
}