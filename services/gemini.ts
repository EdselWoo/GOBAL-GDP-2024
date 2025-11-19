import { GoogleGenAI, Type } from "@google/genai";
import { GDPData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchGlobalGDPData = async (): Promise<GDPData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a comprehensive dataset of the top 80 countries by estimated nominal GDP for the year 2024. Provide the rank, country name, ISO Alpha-3 code, GDP in Trillions of USD, estimated growth rate percentage, and a very brief 1-sentence economic summary.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.INTEGER },
              countryName: { type: Type.STRING },
              isoCode: { type: Type.STRING, description: "ISO 3166-1 alpha-3 code (e.g., USA, CHN, JPN)" },
              gdpTrillions: { type: Type.NUMBER, description: "Nominal GDP in Trillions USD" },
              growthRate: { type: Type.NUMBER, description: "Annual growth rate percentage" },
              description: { type: Type.STRING, description: "Short economic summary" },
            },
            required: ["rank", "countryName", "isoCode", "gdpTrillions", "growthRate", "description"],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GDPData[];
      return data;
    }
    throw new Error("No data received from Gemini");
  } catch (error) {
    console.error("Error fetching GDP data:", error);
    // Extended fallback data
    return [
      { rank: 1, countryName: "United States", isoCode: "USA", gdpTrillions: 28.78, growthRate: 2.7, description: "The world's largest economy driven by services and technology." },
      { rank: 2, countryName: "China", isoCode: "CHN", gdpTrillions: 18.53, growthRate: 4.6, description: "Manufacturing powerhouse transitioning to high-tech industries." },
      { rank: 3, countryName: "Germany", isoCode: "DEU", gdpTrillions: 4.59, growthRate: 0.2, description: "Europe's largest economy, known for automotive and engineering." },
      { rank: 4, countryName: "Japan", isoCode: "JPN", gdpTrillions: 4.11, growthRate: 0.9, description: "Advanced technological economy with a strong export sector." },
      { rank: 5, countryName: "India", isoCode: "IND", gdpTrillions: 3.94, growthRate: 6.8, description: "Fastest growing major economy driven by domestic consumption." },
      { rank: 6, countryName: "United Kingdom", isoCode: "GBR", gdpTrillions: 3.50, growthRate: 0.5, description: "Service-dominated economy with a major financial center in London." },
      { rank: 7, countryName: "France", isoCode: "FRA", gdpTrillions: 3.13, growthRate: 0.8, description: "Diversified economy with tourism, aerospace, and luxury goods." },
      { rank: 8, countryName: "Brazil", isoCode: "BRA", gdpTrillions: 2.33, growthRate: 2.2, description: "Largest economy in South America, rich in natural resources." },
      { rank: 9, countryName: "Italy", isoCode: "ITA", gdpTrillions: 2.33, growthRate: 0.7, description: "Known for high-quality manufacturing, fashion, and tourism." },
      { rank: 10, countryName: "Canada", isoCode: "CAN", gdpTrillions: 2.24, growthRate: 1.3, description: "Wealthy nation with vast energy resources and strong banking." },
      { rank: 11, countryName: "Russia", isoCode: "RUS", gdpTrillions: 2.06, growthRate: 3.2, description: "Energy superpower facing sanctions but maintaining growth." },
      { rank: 12, countryName: "Mexico", isoCode: "MEX", gdpTrillions: 2.02, growthRate: 2.4, description: "Export-oriented economy deeply integrated with North American markets." },
      { rank: 13, countryName: "Australia", isoCode: "AUS", gdpTrillions: 1.79, growthRate: 1.5, description: "Rich in minerals and natural gas, with a strong service sector." },
      { rank: 14, countryName: "South Korea", isoCode: "KOR", gdpTrillions: 1.76, growthRate: 2.3, description: "Leading global producer of electronics, ships, and automobiles." },
      { rank: 15, countryName: "Spain", isoCode: "ESP", gdpTrillions: 1.65, growthRate: 2.1, description: "Eurozone economy supported by tourism and renewable energy." },
    ];
  }
};