import * as telegraf from 'telegraf'

declare module 'telegraf' {
  export interface ContextMessageUpdate {
    session: {
      userId?: number
    }
  }
}
