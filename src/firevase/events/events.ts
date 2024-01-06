import EventEmitter from 'eventemitter3'
import { FirevaseClient } from '..'
import { PathsFrom } from '../types'

/** Maps event names to their listeners */
export type FirevaseEvents = {
  /** Triggered when a resource is removed from the backend */
  resourceRemoved: <C extends FirevaseClient, P extends PathsFrom<C>>(
    client: C,
    resourcePath: P,
    id: string
  ) => void
}

export const firevaseEvents = new EventEmitter<FirevaseEvents>()

export type FirevaseEventEmitter = typeof firevaseEvents
