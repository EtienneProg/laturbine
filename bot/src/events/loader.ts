import { BotClient } from '../index';
import { readyEvent } from './ready';
import { interactionCreateEvent } from './interactionCreate';

export function loadEvents(client: BotClient): void {
    readyEvent(client);
    interactionCreateEvent(client);
}
