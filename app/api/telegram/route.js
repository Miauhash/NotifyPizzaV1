// Local: /app/api/telegram/route.js

import { Bot, GrammyError, HttpError } from "grammy";
import { NextResponse } from "next/server";

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error("TELEGRAM_TOKEN is unset");

const bot = new Bot(token);

// --- LÓGICA DO BOT ---

bot.command("start", async (ctx) => {
  await ctx.reply("Bem-vindo ao Bot de Apostas! Escolha seu plano:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Básico", callback_data: "plano_basico" }],
        [{ text: "Premium", callback_data: "plano_premium" }],
        [{ text: "Gold", callback_data: "plano_gold" }],
      ],
    },
  });
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  console.log("Botão clicado:", data);

  let responseText = "Função em desenvolvimento.";
  if (data === "plano_basico") {
    responseText = "Simulação Básico: \n- Jogo: Flamengo vs Vasco \n- Casa de Aposta: Bet365";
  } else if (data === "plano_premium") {
    responseText = "Simulação Premium: \n- Jogo: Flamengo vs Vasco \n- Probabilidade: Fla 65%, Emp 20%, Vas 15% \n- Estatísticas: Flamengo vem de 5 vitórias seguidas.";
  } else if (data === "plano_gold") {
    responseText = "Simulação Gold: \n- Todas as opções anteriores + Aposta automática configurada.";
  }

  try {
    await ctx.editMessageText(responseText);
  } catch (e) {
    console.error("Erro ao editar a mensagem:", e);
  }

  await ctx.answerCallbackQuery();
});

// --- CONFIGURAÇÃO DO WEBHOOK PARA O NEXT.JS ---

// Flag para garantir que o bot seja inicializado apenas uma vez por "instância" da função
let isBotInitialized = false;

export async function POST(request) {
  try {
    // A CORREÇÃO ESTÁ AQUI:
    // Garante que o bot tenha suas informações (getMe) antes de processar o update.
    if (!isBotInitialized) {
      await bot.init();
      isBotInitialized = true;
      console.log("Bot inicializado com sucesso!");
    }

    const payload = await request.json();
    await bot.handleUpdate(payload);
    
    return NextResponse.json({ status: 200, message: "ok" });
  } catch (error) {
    console.error(error);
    if (error instanceof GrammyError) {
      console.error("Error in request:", error.description);
    } else if (error instanceof HttpError) {
      console.error("Could not contact Telegram:", error);
    }
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}