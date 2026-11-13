import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");

  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function"
    ? raw.toNumber()
    : Number(raw);

  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers)
    ? config.ownerNumbers
    : [];

  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show bot menu.",
    run: async ctx => {
      const menu = buildMenu({
        commands: ctx.commands,
        config: ctx.config,
        theme: ctx.theme,
        mode: ctx.mode,
        uptime: process.uptime()
      });

      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption: "⚡ *𝗦𝗣𝗔𝗥𝗞 𝗠𝗗*\nPowered by Benfei Tech"
          });
        } catch (error) {
          console.warn("SPARK MD artwork could not be sent:", error?.message || error);
        }
      }

      await ctx.reply(menu);
    }
  },

  {
    name: "help",
    category: "General",
    description: "Show available commands.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command => ctx.config.prefix + command.name);

      const chunks = [];
      let current =
        "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 · 𝗛𝗘𝗟𝗣 ⟧ ━━━━━━\n" +
        " ❯ Commands : " + rows.length +
        "\n━━━━━━━━━━━━━━━━━━━━━━\n\n";

      for (const row of rows) {
        const line = " ⌲ " + row + "\n";

        if (current.length + line.length > 3300) {
          chunks.push(current.trimEnd());
          current = "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 · 𝗛𝗘𝗟𝗣 ⟧ ━━━━━━\n\n";
        }

        current += line;
      }

      if (current.trim()) chunks.push(current.trimEnd());

      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    }
  },

  {
    name: "ping",
    category: "General",
    description: "Check bot response.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null
        ? null
        : Math.max(0, Date.now() - timestamp);

      await ctx.reply([
        "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 · 𝗣𝗢𝗡𝗚 ⟧ ━━━━━━",
        " ❯ Status   : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        " ❯ Response : " + (responseMs === null ? "N/A" : responseMs + " ms"),
        " ❯ Uptime   : " + formatDuration(process.uptime()),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status.",
    run: async ctx => {
      await ctx.reply([
        "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 ⟧ ━━━━━━",
        " ❯ Status : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        " ❯ Mode   : " + String(ctx.mode || "public").toUpperCase(),
        " ❯ Uptime : " + formatDuration(process.uptime()),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "owner",
    category: "General",
    description: "Show bot owner.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);

      await ctx.reply([
        "━━━━━━ ⟦ 𝗢𝗪𝗡𝗘𝗥 ⟧ ━━━━━━",
        " ❯ Name   : " + ctx.config.ownerName,
        ...(number ? [" ❯ Number : +" + number] : []),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "support",
    category: "General",
    description: "Show support details.",
    run: async ctx => {
      await ctx.reply([
        "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 · 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ⟧ ━━━━━━",
        " ❯ Owner  : " + ctx.config.ownerName,
        " ❯ GitHub : github.com/Benfeitech/FEI-XMD",
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "time",
    category: "General",
    description: "Show Nigeria time.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(" ❯ 🇳🇬 Nigeria Time : " + value);
    }
  },

  {
    name: "date",
    category: "General",
    description: "Show Nigeria date.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(" ❯ 📅 Date : " + value);
    }
  },

  {
    name: "version",
    category: "General",
    description: "Show bot version.",
    run: async ctx => {
      await ctx.reply([
        "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 ⟧ ━━━━━━",
        " ❯ Version : " + ctx.config.version,
        " ❯ Status  : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        " ❯ Mode    : " + String(ctx.mode || "public").toUpperCase(),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show chat IDs.",
    run: async ctx => {
      await ctx.reply([
        "━━━━━━ ⟦ 𝗖𝗛𝗔𝗧 𝗜𝗡𝗙𝗢 ⟧ ━━━━━━",
        " ❯ Chat   : " + ctx.jid,
        " ❯ Sender : " + (ctx.senderJid || "Unavailable"),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  },

  {
    name: "whoami",
    category: "General",
    description: "Show sender information.",
    run: async ctx => {
      await ctx.reply([
        "━━━━━━ ⟦ 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 ⟧ ━━━━━━",
        " ❯ Name  : " + (ctx.msg?.pushName || "Unknown"),
        " ❯ ID    : " + (ctx.senderJid || "Unavailable"),
        " ❯ Owner : " + (ctx.owner ? "Yes" : "No"),
        "━━━━━━━━━━━━━━━━━━━━━━"
      ].join("\n"));
    }
  }
];

export default commands;
