# MCP Server Tiket KRL KAI

Proyek ini adalah implementasi server MCP (Model Context Protocol) untuk sistem pengecekan jadwal kereta api KRLyang dapat digunakan oleh LLM (Large Language Model) melalui protokol MCP.

## ✨ Fitur

- ✅ Cek List Stasiun
- ✅ Cek Jadwal Kereta
- ✅ Cek Rute Kereta (Lane)
- ✅ Pembelian Tiket (Mock)
- ✅ Generate QR Code Tiket
- ✅ Cek Status Tiket (Mock)

---

## 🚀 Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/namakamu/mcp-tiket-kereta.git
   cd mcp-tiket-kereta


2. Setup MCP Client

```
{
  "mcpServers": {
    "mcp-kai": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/[YourDirectory]/mcp-kai/server.ts"
      ]
    }
  }
}
```
