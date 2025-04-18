import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { Lane, ResponseList, Station, Train } from "./type";
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode'

//TODO NEED TO MOVE TO ENV
const BASE_URL = "https://api-partner.krl.co.id/krl-webs/v1";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc"
const TIKETID = uuidv4();

// Inisialisasi MCP server
const server = new McpServer({
  name: "mcp-kai",
  version: "1.0.0",
});
// untuk generate ID unik

server.tool(
  "get_ticket_qrcode",
  "Mendapatkan QR Code untuk tiket kereta",
  {},
  async () => {

    const ticketUrl = `https://yourapp.com/ticket/${TIKETID}`

    const qr = await QRCode.toDataURL(ticketUrl).then(url => {
      return url;
    });

    return {
      content: [{
        type: "text",
        text: `QR Code untuk tiket kereta: ${qr}`,
      }]
    };
  }
);


server.tool("get_station_list", "Mendapatkan daftar stasiun kereta", {}, async () => {
  try {
    const response = await axios.get<ResponseList<Station>>(`${BASE_URL}/krl-station`);
    const stations = response.data.data; // Sesuaikan dengan struktur data dari API
    return {
      content: [
        {
          type: "text",
          text: `Data stasiun pertama: ${stations.map((station: Station) => `- ${station.sta_name} (${station.sta_id})`).join("\n")}`, // Coba kembalikan JSON stasiun pertama
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Gagal mengambil daftar stasiun: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

server.tool(
  "get_train_schedule",
  "Mendapatkan jadwal kereta berdasarkan stasiun keberangkatan dan waktu keberangkatan dan waktu tujuan dalam rentang waktu jam. Format waktu: HH:MM presisi tidak ada menit seperti 12:00, 13:00, 14:00, dst.",
  {
    stationid: z.string().describe("Stasiun keberangkatan"),
    timefrom: z.string().describe("Waktu keberangkatan"),
    timeto: z.string().describe("Waktu tujuan"),
  },
  async ({ stationid, timefrom, timeto }) => {
    try {
      // Ganti URL berikut dengan endpoint API jadwal kereta yang valid
      const response = await axios.get<ResponseList<Train>>(`${BASE_URL}/schedule`, {
        params: {
          stationid: stationid,
          timefrom: timefrom,
          timeto: timeto,
        },
        headers: {
          "Authorization": "Bearer " + TOKEN,
        },
      });
      const schedule = response.data.data;

      return {
        content: [
          {
            type: "text",
            text: `Jadwal kereta dari ${stationid} jam ${timefrom} sampai ${timeto}:\n\n${schedule.map((train: Train) =>
              `🚂 ${train.ka_name}\n` +
              `   No. KA: ${train.train_id}\n` +
              `   Rute: ${train.route_name}\n` +
              `   Tujuan: ${train.dest}\n` +
              `   Waktu Berangkat: ${train.time_est}\n` +
              `   Waktu Tiba: ${train.dest_time}\n`
            ).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Gagal mengambil jadwal kereta: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_lane_list",
  "Mendapatkan daftar stasiun yang dilewati kereta berdasarkan ID kereta.",
  {
    trainid: z.string().describe("ID kereta"),
  },
  async ({ trainid }) => {
    try {
      const response = await axios.get<ResponseList<Lane>>(`${BASE_URL}/schedule-train`, {
        params: {
          trainid: trainid,
        },
        headers: {
          "Authorization": "Bearer " + TOKEN,
        },
      });
      const trains = response.data.data;

      return {
        content: [
          {
            type: "text",
            text: `Daftar kereta yang tersedia:
            ${trains.map((t: Lane) => `- ${t.station_name} - ${t.time_est} - ${t.transit_station ? "Transit" : "Tidak Transit"}`).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Gagal mengambil daftar kereta: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);


server.tool(
  "buy_train_ticket",
  "Membeli tiket kereta berdasarkan stasiun keberangkatan dan stasiun tujuan dan waktu keberangkatan dan waktu tujuan.",
  {
    stationFrom: z.string().describe("Stasiun keberangkatan"),
    stationTo: z.string().describe("Stasiun tujuan"),
    timeFrom: z.string().describe("Waktu keberangkatan"),
  },
  async ({ stationFrom, stationTo, timeFrom }) => {
    //TODO: This only mock the ticket purchase process
    return {
      content: [
        {
          type: "text",
          text: `Tiket berhasil dibeli!\n\nDetail tiket:\n- Stasiun Keberangkatan: ${stationFrom}\n- Stasiun Tujuan: ${stationTo}\n- Waktu Keberangkatan: ${timeFrom}\n\n, tiket berhasil dibeli, tiket id: ${TIKETID}`,
        },
      ],
    };
  }
);

server.tool(
  "get_ticket_status",
  "Mendapatkan status tiket kereta berdasarkan ID tiket.",
  {
    ticketid: z.string().describe("ID tiket"),
  },
  async ({ ticketid }) => {
    if (ticketid === TIKETID) {
      return {
        content: [
          {
            type: "text",
            text: `Berikut adalah status tiket dengan ID ${ticketid}: https://placehold.co/400x400`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: "Tiket tidak ditemukan",
          },
        ],
        isError: true,
      };
    }
  }
);



// Jalankan server dengan transport stdio
async function main() {
  console.log("Starting MCP Server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server is running and ready to accept connections");
}

main().catch((error) => {
  console.error("Error starting MCP Server:", error);
  process.exit(1);
});