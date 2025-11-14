// @ts-check

/**
 * @type {CommandMeta}
 */
export const meta = {
  name: "ytdl",
  description: "Search YouTube videos and stream them via aryan API.",
  author: "MrKimstersDev | yt-search | + Liane | API Sync by Christus",
  version: "1.0.5",
  usage: "{prefix}{name} <search query>",
  category: "Media",
  permissions: [0],
  noPrefix: false,
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["vid", "youtube", "ytb"],
  icon: "🎥",
  noLevelUI: true,
  noWeb: true,
};

import yts from "yt-search";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cass/unispectra";

export const langs = {
  en: {
    noQuery:
      "Please provide a search query for a YouTube video!\nExample: {prefix}ytdl never gonna give you up",
    noResults: "No videos found with that query!",
    error: "Error fetching video data: %1",
    invalidSelection: "Please select a valid number between 1 and 5!",
    invalidFormat:
      "Please reply in the format: number | video or number | audio\nExample: 1 | video",
  },
};

async function fetchVideoData(query) {
  try {
    const searchResults = await yts(query);
    return searchResults.videos.slice(0, 5).map((vid) => ({
      id: { videoId: vid.videoId },
      snippet: {
        title: vid.title,
        channelTitle: vid.author.name,
        publishedAt: vid.ago,
      },
      fallback: true,
    }));
  } catch (error) {
    console.error("yt-search error:", error.message);
    throw error;
  }
}

function formatVideoList(videos) {
  return (
    videos
      .map((vid, index) => {
        const publishedAt = vid.snippet.publishedAt || "Unknown";
        return ` • ${index + 1}. **${
          vid.snippet.title
        }** (Uploaded ${publishedAt})`;
      })
      .join("\n") +
    "\n━━━━━━━━━━━━━━━\n✦ Reply with: number | video or number | audio\nExample: 1 | video"
  );
}

function formatVideoDetails(video) {
  const videoId = video.id.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const publishedAt = video.snippet.publishedAt || "Unknown";
  return `🎥 **${video.snippet.title}**\n${UNISpectra.arrow} ${video.snippet.channelTitle}\n${UNISpectra.arrowFromT} Uploaded ${publishedAt}\n🔗 ${videoUrl}`;
}

const ARYAN_API = "http://65.109.80.126:20409/aryan/yx";

export const entry = defineEntry(
  async ({ input, output, args, prefix, commandName, getLang }) => {
    try {
      const query = args.join(" ").trim();

      if (!query) {
        return output.reply(getLang("noQuery", prefix, commandName));
      }

      await output.reply(
        `🔎 | Searching YouTube for **"${query}"**.\n⏳ | Please **wait**...🤍`
      );

      const videos = await fetchVideoData(query);

      if (!videos || videos.length === 0) {
        return output.reply(getLang("noResults"));
      }

      const messageInfo = await output.reply(formatVideoList(videos));

      input.setReply(messageInfo.messageID, {
        key: "ytdl",
        id: input.senderID,
        results: videos,
      });
    } catch (error) {
      console.error("Entry error:", error.message);
      output.reply(getLang("error", error.message));
    }
  }
);

export async function reply({ input, output, repObj, detectID, langParser }) {
  const getLang = langParser.createGetLang(langs);
  const { id, results } = repObj;

  if (input.senderID !== id || !results) return;

  const parts = input.body.trim().split(/\s*\|\s*/);
  if (parts.length !== 2) {
    return output.reply(getLang("invalidFormat"));
  }

  const selection = parseInt(parts[0]);
  const format = parts[1].toLowerCase();

  if (isNaN(selection) || selection < 1 || selection > 5) {
    return output.reply(getLang("invalidSelection"));
  }

  if (format !== "video" && format !== "audio") {
    return output.reply(getLang("invalidFormat"));
  }

  const selectedVideo = results[selection - 1];

  input.delReply(String(detectID));

  const videoId = selectedVideo.id.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 🔥 API ORIGINALE REMPLACÉE PAR L’API DE TA CMD YOUTUBE
  const streamUrl = `${ARYAN_API}?url=${encodeURIComponent(videoUrl)}&type=${
    format === "video" ? "mp4" : "mp3"
  }`;

  try {
    await output.reply({
      body: formatVideoDetails(selectedVideo),
      attachment: await global.utils.getStreamFromURL(streamUrl),
    });
  } catch (error) {
    console.error("Streaming error:", error.message);
    output.reply(getLang("error", error.message));
  }
}
