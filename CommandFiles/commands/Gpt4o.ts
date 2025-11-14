import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "gpt4o",
  meta: {
    otherNames: ["4o", "ai4o", "nekogpt"],
    author: "Christus",
    description: "Chat with NekoLabs GPT-4o AI.",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🤖 NekoLabs GPT-4o",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#00A2FF", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface GPT4oResponse {
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
  await output.reaction("⌛"); // ⌛ CHARGEMENT

  if (!ask) {
    cancelCooldown();
    await output.reaction("❌"); // ❌ ERREUR
    return output.reply(
      `❓ Please type a message to ask **GPT-4o**.\n\nExample: ${prefix}${commandName} Hello GPT-4o`
    );
  }

  try {
    const systemPrompt = "You are a helpful assistant";

    const apiURL =
      `https://api.nekolabs.web.id/ai/gpt/4o?` +
      `text=${encodeURIComponent(ask)}&systemPrompt=${encodeURIComponent(systemPrompt)}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<GPT4oResponse> = await axios.get(apiURL, {
      headers,
      timeout: 20_000,
    });

    const replyText =
      res.data?.result || "⚠️ No response received from GPT-4o API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🤖 **NekoLabs GPT-4o**\n\n` +
        `${replyText}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("🤖"); // 🤖 SUCCÈS

    const message = await output.reply(form);

    // 📌 Conversation continue
    message.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("GPT-4o API error:", err?.message || err);

    await output.reaction("❌"); // ❌ ERREUR
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;
