const SMALL_CAPS = {
  "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e",
  "ғ": "f", "ꜰ": "f", "ɢ": "g", "ʜ": "h", "ɪ": "i",
  "ᴊ": "j", "ᴋ": "k", "ʟ": "l", "ᴍ": "m", "ɴ": "n",
  "ᴏ": "o", "ᴘ": "p", "ǫ": "q", "ʀ": "r", "ꜱ": "s",
  "ᴛ": "t", "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "ʏ": "y",
  "ᴢ": "z"
};

function boldHeading(value) {
  return [...String(value)].map(char => {
    const normalized = (SMALL_CAPS[char] || char).toUpperCase();
    const code = normalized.codePointAt(0);

    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(0x1D5D4 + code - 65);
    }

    return normalized;
  }).join("");
}

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));

  const days = Math.floor(remaining / 86400);
  remaining %= 86400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);

  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");

  if (!parts.length) parts.push("0m");

  return parts.join(" ");
}

export function getSectionCommands(section, commands = []) {
  const visible = commands.filter(command => !command.hidden);

  if (Array.isArray(section.commandNames)) {
    const selected = new Set(
      section.commandNames.map(value => String(value).toLowerCase())
    );

    return visible.filter(command =>
      selected.has(String(command.name).toLowerCase())
    );
  }

  const categories = Array.isArray(section.categories) && section.categories.length
    ? section.categories
    : [section.key];

  const excluded = new Set(
    (section.excludeNames || []).map(name => String(name).toLowerCase())
  );

  return visible.filter(command =>
    categories.includes(command.category) &&
    !excluded.has(String(command.name).toLowerCase())
  );
}

export function buildMenu({
  commands = [],
  config = {},
  theme = {},
  mode = config.mode || "public",
  uptime = process.uptime()
} = {}) {
  const sections = Array.isArray(theme.sections)
    ? theme.sections
    : [];

  const prefix = String(config.prefix || ".");
  const owner = String(config.ownerName || "Benfei Tech");
  const botMode = String(mode || "public");
  const visible = commands.filter(command => !command.hidden);

  const lines = [
    "━━━━━━ ⟦ 𝗦𝗣𝗔𝗥𝗞 𝗠𝗗 ⟧ ━━━━━━",
    " ❯ Owner   : " + owner,
    " ❯ Mode    : " + botMode.charAt(0).toUpperCase() + botMode.slice(1).toLowerCase(),
    " ❯ Uptime  : " + formatDuration(uptime),
    "━━━━━━━━━━━━━━━━━━━━━━",
    ""
  ];

  const assigned = new Set();

  for (const section of sections) {
    const members = getSectionCommands(section, visible)
      .filter(command => !assigned.has(String(command.name).toLowerCase()));

    // Skip empty sections.
    if (!members.length) continue;

    lines.push("⌜ " + boldHeading(section.title || section.key) + " ⌟");

    for (const command of members) {
      assigned.add(String(command.name).toLowerCase());

      lines.push(
        " ⌲ " + prefix + command.name
      );
    }

    lines.push("⌞━━━━━━━━━━━━━━⌟", "");
  }

  // Commands not assigned to any section.
  const ungrouped = visible.filter(command =>
    !assigned.has(String(command.name).toLowerCase())
  );

  if (ungrouped.length) {
    lines.push("⌜ 𝗢𝗧𝗛𝗘𝗥 ⌟");

    for (const command of ungrouped) {
      lines.push(" ⌲ " + prefix + command.name);
    }

    lines.push("⌞━━━━━━━━━━━━━━⌟");
  }

  if (!visible.length) {
    lines.push(" ⌲ No commands available.");
  }

  return lines.join("\n").trim();
}
