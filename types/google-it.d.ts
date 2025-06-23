declare module 'google-it' {
  interface SearchResult {
    title: string;
    link: string;
    snippet: string;
  }

  interface SearchOptions {
    query: string;
    limit?: number;
    'only-urls'?: boolean;
    'exclude-sites'?: string[];
  }

  function googleIt(options: SearchOptions): Promise<SearchResult[]>;
  export = googleIt;
}
