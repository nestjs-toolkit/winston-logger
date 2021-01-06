import { RequestType } from '../builders';

export interface SubjectActivity {
  _id?: string;
  id?: string;
  collection?: string;
  toJSON?: () => any;
}

export interface CauserActivity extends SubjectActivity {
  username?: string;
}

export type LevelActivity =
  | 'error'
  | 'debug'
  | 'warn'
  | 'data'
  | 'http'
  | 'info'
  | 'verbose'
  | 'silly'
  | 'custom';

export type ConfigActivity = {
  level: LevelActivity;
};

export type MetaActivity = {
  namespace?: SubjectActivity;
  properties?: Record<string, any>;
  subject?: SubjectActivity;
  subjectCollection?: string;
  causer?: CauserActivity;
  causerCollection?: string;
  request?: RequestType;
  error?: any;
  context?: string;
  kind?: string; // type object, ex: HTTP, GQL, CATEGORY_CREATE...
};
