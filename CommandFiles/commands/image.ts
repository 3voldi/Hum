import axios from "axios";

const config = {
  name: "generateImage",
  version: "1.0.1",
  permissions: [0],
  noPrefix: "both",
  credits: "Voldigo",
  description: "Generate an AI image from your text prompt and send it directly.",
  category: "AI",
  usages: "[prompt text]",
  cooldown: 5,
};

const style = {
  titleFont: "bold",
  title: "🖼️ AI Image Generator",
  contentFont: "fancy",
};

async function onCall({ message, args, sendImage }) {
  const prompt = args.join(" ");
  if (!prompt) return message.reply("❌ Please provide a prompt to generate an image.");

  await message.reply("🎨 Generating image...");

  try {
    const api = `https://api.nekolabs.web.id/ai/ai4chat/image?prompt=${encodeURIComponent(prompt)}&ratio=1:1`;
    const res = await axios.get(api);

    if (res.data.success && res.data.result) {
      // Envoie direct de l'image
      await sendImage(res.data.result, {
        caption: `🖼️ Here is your image for prompt: "${prompt}"`,
      });
    } else {
      await message.reply("❌ Failed to generate image. Please try again.");
    }
  } catch (err: any) {
    console.error(err);
    await message.reply(`❌ Error: ${err?.message || "Unknown error"}`);
  }
}

export default {
  config,
  onCall,
  style,
};
