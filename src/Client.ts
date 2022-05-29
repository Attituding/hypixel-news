import { container, SapphireClient } from '@sapphire/framework';
import { Intents, Options, Sweepers } from 'discord.js';
import { Config } from './@types/Config';
import { i18n } from './locales/i18n';
import { Database } from './utility/Database';

export class Client extends SapphireClient {
    public constructor() {
        super({
            allowedMentions: {
                parse: ['users'],
                repliedUser: true,
            },
            failIfNotExists: false,
            intents: [Intents.FLAGS.GUILDS],
            makeCache: Options.cacheWithLimits({
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildMemberManager: 25,
                GuildEmojiManager: 0,
                GuildScheduledEventManager: 0,
                GuildStickerManager: 0,
                MessageManager: 50,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                VoiceStateManager: 0,
            }),
            loadDefaultErrorListeners: false,
            presence: {
                status: 'online',
            },
            sweepers: {
                guildMembers: {
                    interval: 600,
                    filter: Sweepers.filterByLifetime({
                        lifetime: 60,
                    }),
                },
                messages: {
                    interval: 600,
                    lifetime: 60,
                },
                threadMembers: {
                    interval: 600,
                    filter: Sweepers.filterByLifetime({
                        lifetime: 1,
                    }),
                },
                threads: {
                    interval: 600,
                    lifetime: 30,
                },
                users: {
                    interval: 3600,
                    filter: Sweepers.filterByLifetime({
                        lifetime: 3600,
                    }),
                },
            },
        });
    }

    public async init() {
        container.config = (
            await Database.query(
                'SELECT * FROM config WHERE index = 0',
            )
        ).rows[0] as Config;

        container.database = Database;

        //container.commands = new Collection();
        //container.cooldowns = new Collection();
        //container.core = new Core(client);
        //container.customPresence = null;
        container.i18n = new i18n();

        await super.login();
    }
}

declare module '@sapphire/pieces' {
    interface Container {
        //commands: Collection<string, Command>,
        config: Config,
        //cooldowns: Collection<string, Collection<string, number>>,
        //core: Core,
        //customPresence: PresenceData | null,
        database: Database;
        i18n: i18n,
    }
}