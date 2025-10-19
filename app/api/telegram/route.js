// ... (importações do grammy, etc.)
import { MercadoPagoConfig, Payment } from '@mercadopago/sdk';

// Configura o Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// ... (código do bot)

// Altere o manipulador de cliques
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data; // ex: "comprar_premium"
  const plan = data.split('_')[1]; // "premium"
  const userId = ctx.from.id;

  // Preços simulados
  const prices = {
    basico: 19.90,
    premium: 49.90,
    gold: 99.90,
  };

  if (!prices[plan]) {
    await ctx.answerCallbackQuery({ text: "Plano inválido." });
    return;
  }

  // --- Lógica para Criar o Pagamento ---
  try {
    const payment = new Payment(client);
    const body = {
      transaction_amount: prices[plan],
      description: `Plano ${plan} - Bot de Apostas`,
      payment_method_id: 'pix', // ou pode deixar o usuário escolher
      payer: {
        email: `user_${userId}@telegram.bot`, // Email de exemplo
      },
      // ESSA É A PARTE MAIS IMPORTANTE
      external_reference: `${userId}_${plan}`, // Salvamos o ID do Telegram e o plano aqui
      notification_url: 'https://seu-projeto.vercel.app/api/payment-webhook',
    };

    const result = await payment.create({ body });
    const paymentLink = result.point_of_interaction.transaction_data.ticket_url;

    await ctx.reply(`Ótima escolha! Para ativar seu plano ${plan}, realize o pagamento no link abaixo:\n\n${paymentLink}`);
    await ctx.answerCallbackQuery();

  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    await ctx.reply("Desculpe, não consegui gerar seu link de pagamento. Tente novamente mais tarde.");
  }
});

// ... (Restante do código do webhook para o Telegram)