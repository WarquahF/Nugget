console.log("File is running bro");
const fs = require("node:fs");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

async function main() {
  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const text = "Good evening. All systems are operating within normal parameters.";

    const response = await client.textToSpeech.convert(
      "w2ZdKT3ghAOcMRbpjC3u", // Liam Dale voice
      {
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.9,
          style: 0.1,
          use_speaker_boost: true,
        },
      }
    );

    fs.writeFileSync("output.mp3", Buffer.from(response));

    console.log("🎙️ Nugget spoke successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();