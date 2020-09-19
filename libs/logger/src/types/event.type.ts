import { Request } from 'express';
import { CauserActivity } from '../builders';

export interface OnModelChangedEvent {
  readonly action: string
  readonly collection: string
  readonly model: any
  readonly req?: Request
  readonly user?: CauserActivity
  readonly tags?: string[]
  readonly old?: any
  readonly changes?: any
  readonly detailedDiff?: any
}
