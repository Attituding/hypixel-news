import {
    CommandInteraction,
    GuildChannel,
    type Interaction,
    TextChannel,
} from 'discord.js';
import { type Pool } from 'pg';
import {
    type Scope,
    type SeverityLevel,
} from '@sentry/node';
import * as SentryClient from '@sentry/node';
import { type Core } from '../core/Core';
import { HTTPError } from '../errors/HTTPError';
import { slashCommandResolver } from '../utility/utility';

export class Sentry {
    readonly scope: Scope;

    constructor() {
        this.scope = new SentryClient.Scope();
    }

    public baseErrorContext(incidentID: string) {
        this.scope.setTags({
            incidentID: incidentID,
        });

        return this;
    }

    public baseInteractionContext(interaction: Interaction) {
        const {
            user,
            guild,
            channel,
            client,
        } = interaction;

        this.scope.setTags({
            interactionCommand: interaction instanceof CommandInteraction
                ? slashCommandResolver(
                    interaction,
                ).slice(0, 200)
                : null,
            interactionCreatedTimestamp: interaction.createdTimestamp,
            userID: user.id,
            interactionID: interaction.id,
            guildID: guild?.id,
            guildName: guild?.name,
            guildOwnerID: guild?.ownerId,
            guildMemberCount: guild?.memberCount,
            guildPermissions: guild?.me?.permissions.bitfield.toString(),
            channelID: channel?.id,
            channelType: channel?.type,
            channelName: channel instanceof TextChannel
                ? channel.name
                : null,
            channelPermissions: channel instanceof GuildChannel
                ? guild?.me?.permissionsIn(channel).bitfield.toString()
                : null,
            ping: client.ws.ping,
        });

        return this;
    }

    captureException(exception: unknown) {
        SentryClient.captureException(
            exception,
            this.scope,
        );

        return this;
    }

    captureMessages(...messages: string[]) {
        messages.forEach((message) => {
            SentryClient.captureMessage(
                message,
                this.scope,
            );
        });

        return this;
    }

    databaseContext(pool: Pool) {
        this.scope.setTags({
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
        });

        return this;
    }

    baseInteractionPreconditionContext(precondition: string) {
        this.scope.setTags({
            precondition: precondition,
        });

        return this;
    }

    requestContext(error: unknown, core: Core) {
        this.scope.setTags({
            type: error instanceof Error
                ? error.name
                : null,
            resumingIn: core.errors.getTimeout(),
            lastHourAbort: core.errors.abort.lastHour,
            lastHourGeneric: core.errors.generic.lastHour,
            lastHourHTTP: core.errors.http.lastHour,
            nextTimeoutAbort: core.errors.abort.timeout,
            nextTimeoutGeneric: core.errors.generic.timeout,
            nextTimeoutHTTP: core.errors.http.timeout,
            uses: core.uses,
            status: error instanceof HTTPError
                ? error.status
                : null,
            statusText: error instanceof HTTPError
                ? error.statusText
                : null,
        });

        return this;
    }

    setSeverity(level: SeverityLevel) {
        this.scope.setLevel(level);

        return this;
    }
}