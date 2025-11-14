import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "gpt35",
  meta: {
    otherNames: ["turbo", "ai35", "chat35"],
    author: "Christus",
    description: "AI conversational system powered by NekoLabs GPT-3.5 Turbo API.",
    icon: "🧠",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🧠 GPT-3.5 Turbo",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#FFD700", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface GPT35Response {
  success: boolean;
  result?: string;
}

async function main({ output, args, input, commandName, prefix, cancelCooldown }: CommandContext) {
  let ask = args.join(" ");
  await output.reaction("🚀"); // nouvelle réaction début

  if (!ask) {
    cancelCooldown();
    await output.reaction("⚠️");
    return output.reply(
      `❓ Please provide a message.\n\nExample: ${prefix}${commandName} Hello GPT-3.5!`
    );
  }

  try {
    const apiURL = `https://api.nekolabs.web.id/ai/gpt/3.5-turbo?text=${encodeURIComponent(ask)}&systemPrompt=You+are+a+helpful+assistant`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<GPT35Response> = await axios.get(apiURL, {
      headers,
      timeout: 20_000,
    });

    const replyText = res.data?.result || "⚠️ No response received from GPT-3.5 Turbo API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🤖 **GPT-3.5 Turbo**\n\n` +
        `${replyText}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("✅"); // nouvelle réaction succès

    const msg = await output.reply(form);

    // 📌 Conversation continue
    msg.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });

  } catch (err: any) {
    console.error("GPT-3.5 Turbo API error:", err?.message || err);

    await output.reaction("⚠️"); // nouvelle réaction erreur
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\n\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;
