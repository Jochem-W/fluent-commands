/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js"
import {
  getOptionValue,
  OptionValues,
  PartialOption,
  PartialSubcommand,
  PartialSubcommandGroup,
  SlashCommand,
  Subcommand,
  SubcommandWithOptions,
} from "./internal.mjs"

export function slashCommand(
  name: Lowercase<string>,
  description: string,
): SlashCommand {
  return {
    builder: new SlashCommandBuilder()
      .setName(name)
      .setDescription(description),
    contexts(context, ...rest) {
      this.builder.setContexts(context, ...rest)
      return this
    },
    defaultMemberPermissions(permissions) {
      this.builder.setDefaultMemberPermissions(permissions)
      return this
    },
    integrationTypes(type, ...rest) {
      this.builder.setIntegrationTypes(type, ...rest)
      return this
    },
    nsfw() {
      this.builder.setNSFW(true)
      return this
    },
    options(options) {
      return {
        ...this,
        options,
        handler(handler) {
          return {
            ...this,
            async autocomplete(interaction) {
              const focused = interaction.options.getFocused(true)
              const option = options[focused.name] as PartialOption | undefined
              if (!option || !("handleAutocomplete" in option)) {
                throw new Error() // TODO error text
              }

              await option.handleAutocomplete(interaction)
            },
            async handle(interaction) {
              const values = Object.fromEntries(
                Object.entries(options).map(([key, option]) => [
                  key,
                  getOptionValue(interaction, option),
                ]),
              ) as OptionValues<typeof options>
              await handler(interaction, values)
            },
            contexts(context, ...rest) {
              this.builder.setContexts(context, ...rest)
              return this
            },
            defaultMemberPermissions(permissions) {
              this.builder.setDefaultMemberPermissions(permissions)
              return this
            },
            integrationTypes(type, ...rest) {
              this.builder.setIntegrationTypes(type, ...rest)
              return this
            },
            nsfw() {
              this.builder.setNSFW(true)
              return this
            },
          }
        },
        contexts(context, ...rest) {
          this.builder.setContexts(context, ...rest)
          return this
        },
        defaultMemberPermissions(permissions) {
          this.builder.setDefaultMemberPermissions(permissions)
          return this
        },
        integrationTypes(type, ...rest) {
          this.builder.setIntegrationTypes(type, ...rest)
          return this
        },
        nsfw() {
          this.builder.setNSFW(true)
          return this
        },
      }
    },
    handler(handler) {
      return {
        ...this,
        handle: handler,
        autocomplete() {
          throw new Error() // TODO error text
        },
        contexts(context, ...rest) {
          this.builder.setContexts(context, ...rest)
          return this
        },
        defaultMemberPermissions(permissions) {
          this.builder.setDefaultMemberPermissions(permissions)
          return this
        },
        integrationTypes(type, ...rest) {
          this.builder.setIntegrationTypes(type, ...rest)
          return this
        },
        nsfw() {
          this.builder.setNSFW(true)
          return this
        },
      }
    },
    subcommands(subcommands: Record<string, PartialSubcommand>) {
      for (const [name, { builder }] of Object.entries(subcommands)) {
        builder.setName(name)
        this.builder.addSubcommand(builder)
      }

      let handle
      if ("handle" in this) {
        const newThis = this as Omit<
          SlashCommand<keyof SlashCommand, true>,
          "autocomplete"
        >
        handle = async (interaction: ChatInputCommandInteraction) => {
          const group = interaction.options.getSubcommandGroup()
          if (group) {
            await newThis.handle(interaction)
            return
          }

          const name = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = subcommands[name]
          if (!command) {
            throw new Error() // TODO error text
          }

          await command.handle(interaction)
        }
      } else {
        handle = async (interaction: ChatInputCommandInteraction) => {
          const name = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = subcommands[name]
          if (!command) {
            throw new Error() // TODO error text
          }

          await command.handle(interaction)
        }
      }

      let autocomplete
      if ("autocomplete" in this) {
        const newThis = this as Omit<
          SlashCommand<keyof SlashCommand, true>,
          "handle"
        >
        autocomplete = async (interaction: AutocompleteInteraction) => {
          const group = interaction.options.getSubcommandGroup()
          if (group) {
            await newThis.autocomplete(interaction)
            return
          }

          const subcommandName = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = subcommands[subcommandName] as
            | PartialSubcommand
            | SubcommandWithOptions<
                Record<Lowercase<string>, PartialOption>,
                Exclude<keyof Subcommand, "options">
              >
            | undefined
          if (!command) {
            throw new Error() // TODO error text
          }

          if (command.options instanceof Function || !command.options) {
            throw new Error() // TODO error text
          }

          const focused = interaction.options.getFocused(true)

          const option = command.options[focused.name as Lowercase<string>]
          if (!option || !("handleAutocomplete" in option)) {
            throw new Error() // TODO error text
          }

          await option.handleAutocomplete(interaction)
        }
      } else {
        autocomplete = async (interaction: AutocompleteInteraction) => {
          const subcommandName = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = subcommands[subcommandName] as
            | PartialSubcommand
            | SubcommandWithOptions<
                Record<Lowercase<string>, PartialOption>,
                Exclude<keyof Subcommand, "options">
              >
            | undefined
          if (!command) {
            throw new Error() // TODO error text
          }

          if (command.options instanceof Function || !command.options) {
            throw new Error() // TODO error text
          }

          const focused = interaction.options.getFocused(true)

          const option = command.options[focused.name as Lowercase<string>]
          if (!option || !("handleAutocomplete" in option)) {
            throw new Error() // TODO error text
          }

          await option.handleAutocomplete(interaction)
        }
      }

      return {
        ...this,
        handle,
        autocomplete,
        contexts(context, ...rest) {
          this.builder.setContexts(context, ...rest)
          return this
        },
        defaultMemberPermissions(permissions) {
          this.builder.setDefaultMemberPermissions(permissions)
          return this
        },
        integrationTypes(type, ...rest) {
          this.builder.setIntegrationTypes(type, ...rest)
          return this
        },
        nsfw() {
          this.builder.setNSFW(true)
          return this
        },
      }
    },
    subcommandGroups(subcommandGroups: Record<string, PartialSubcommandGroup>) {
      for (const [name, { builder }] of Object.entries(subcommandGroups)) {
        builder.setName(name)
        this.builder.addSubcommandGroup(builder)
      }

      let handle
      if ("handle" in this) {
        const newThis = this as Omit<
          SlashCommand<keyof SlashCommand, true>,
          "autocomplete"
        >
        handle = async (interaction: ChatInputCommandInteraction) => {
          const groupName =
            interaction.options.getSubcommandGroup() as Lowercase<string> | null
          if (!groupName) {
            await newThis.handle(interaction)
            return
          }

          const group = subcommandGroups[groupName]
          if (!group) {
            throw new Error() // TODO error text
          }

          const name = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = group.subcommands[name]
          if (!command) {
            throw new Error() // TODO error text
          }

          await command.handle(interaction)
        }
      } else {
        handle = async (interaction: ChatInputCommandInteraction) => {
          const groupName = interaction.options.getSubcommandGroup(
            true,
          ) as Lowercase<string>
          const group = subcommandGroups[groupName]
          if (!group) {
            throw new Error() // TODO error text
          }

          const name = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = group.subcommands[name]
          if (!command) {
            throw new Error() // TODO error text
          }

          await command.handle(interaction)
        }
      }

      let autocomplete
      if ("autocomplete" in this) {
        const newThis = this as Omit<
          SlashCommand<keyof SlashCommand, true>,
          "handle"
        >
        autocomplete = async (interaction: AutocompleteInteraction) => {
          const groupName = interaction.options.getSubcommandGroup()
          if (!groupName) {
            await newThis.autocomplete(interaction)
            return
          }

          const group = subcommandGroups[groupName]
          if (!group) {
            throw new Error() // TODO error text
          }

          const subcommandName = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = group.subcommands[subcommandName] as
            | PartialSubcommand
            | SubcommandWithOptions<
                Record<Lowercase<string>, PartialOption>,
                Exclude<keyof Subcommand, "options">
              >
            | undefined

          if (!command) {
            throw new Error() // TODO error text
          }

          if (command.options instanceof Function || !command.options) {
            throw new Error() // TODO error text
          }

          const focused = interaction.options.getFocused(true)

          const option = command.options[focused.name as Lowercase<string>]
          if (!option || !("handleAutocomplete" in option)) {
            throw new Error() // TODO error text
          }

          await option.handleAutocomplete(interaction)
        }
      } else {
        autocomplete = async (interaction: AutocompleteInteraction) => {
          const groupName = interaction.options.getSubcommandGroup(true)

          const group = subcommandGroups[groupName]
          if (!group) {
            throw new Error() // TODO error text
          }

          const subcommandName = interaction.options.getSubcommand(
            true,
          ) as Lowercase<string>
          const command = group.subcommands[subcommandName] as
            | PartialSubcommand
            | SubcommandWithOptions<
                Record<Lowercase<string>, PartialOption>,
                Exclude<keyof Subcommand, "options">
              >
            | undefined

          if (!command) {
            throw new Error() // TODO error text
          }

          if (command.options instanceof Function || !command.options) {
            throw new Error() // TODO error text
          }

          const focused = interaction.options.getFocused(true)

          const option = command.options[focused.name as Lowercase<string>]
          if (!option || !("handleAutocomplete" in option)) {
            throw new Error() // TODO error text
          }

          await option.handleAutocomplete(interaction)
        }
      }

      return {
        ...this,
        handle,
        autocomplete,
        contexts(context, ...rest) {
          this.builder.setContexts(context, ...rest)
          return this
        },
        defaultMemberPermissions(permissions) {
          this.builder.setDefaultMemberPermissions(permissions)
          return this
        },
        integrationTypes(type, ...rest) {
          this.builder.setIntegrationTypes(type, ...rest)
          return this
        },
        nsfw() {
          this.builder.setNSFW(true)
          return this
        },
      }
    },
  }
}
