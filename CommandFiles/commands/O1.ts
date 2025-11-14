import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "o1",
  meta: {
    otherNames: ["openai-o1", "ai-o1", "nekoo1"],
    author: "Christus",
    description: "Chat with NekoLabs OpenAI O1 assistant.",
    icon: "🧠",
    version: "1.0.1",
    noPrefix: "both",
  },
  title: {
    content: "🧠 NekoLabs OpenAI O1",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#8A2BE2", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface O1ResponseType {
  success: boolean;
  result?: string;
}

async function main({
  output,
  args,
  input,
  commandName,
  prefix,
  cancelCooldown,
}: CommandContext) {
  let ask = args.join(" ");

  await output.reaction("🕹️"); // CHARGEMENT unique

  if (!ask) {
    cancelCooldown();
    await output.reaction("❌"); // ERREUR
    return output.reply(
      `❓ Please type a message for **OpenAI O1**.\n\nExample: ${prefix}${commandName} Hello O1`
    );
  }

  try {
    const systemPrompt = "You are a helpful assistant";

    const apiURL =
      `https://api.nekolabs.web.id/ai/openai/o1?` +
      `text=${encodeURIComponent(ask)}&systemPrompt=${encodeURIComponent(systemPrompt)}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<O1ResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    const answer =
      res.data?.result || "⚠️ No response received from OpenAI O1 API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🧠 **NekoLabs OpenAI O1**\n\n` +
        `${answer}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("💡"); // SUCCÈS unique

    const info = await output.reply(form);

    // Conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("O1 API error:", err?.message || err);

    await output.reaction("❌"); // ERREUR unique
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;
