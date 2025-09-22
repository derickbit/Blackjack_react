// utils/imageUtils.js

/**
 * Corrige URLs de imagens baseada no ambiente (desenvolvimento/produção)
 * @param {string} imagePath - caminho da imagem retornado pela API
 * @returns {string} - URL completa da imagem
 */

// Cache para evitar logs repetidos
const loggedIds = new Set();

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Debug: Log do que está sendo recebido
  console.log(`🖼️ DEBUG getImageUrl: Recebido "${imagePath}"`);

  // Se já é uma URL completa (S3 ou outro CDN), retorna como está
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    console.log(`✅ URL completa detectada: ${imagePath}`);
    return imagePath;
  }

  // Detecta automaticamente o ambiente baseado na mesma lógica do axios_client
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  console.log(`🌍 Ambiente: ${isProduction ? "PRODUÇÃO" : "DESENVOLVIMENTO"}`);

  // DESENVOLVIMENTO LOCAL - usa o Laravel
  if (!isProduction) {
    // Se imagePath é apenas um número (ID da imagem), isso indica um problema no backend
    if (/^\d+$/.test(imagePath.toString())) {
      if (!loggedIds.has(imagePath)) {
        console.error(
          `❌ PROBLEMA BACKEND: Campo 'imagem' retornou apenas ID (${imagePath}) em vez do caminho do arquivo.`
        );
        loggedIds.add(imagePath);
      }
      return null;
    }

    // Remove a barra inicial se existir
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    const devUrl = `http://localhost:8000/storage/${cleanPath}`;
    console.log(`🔧 DEV URL: ${devUrl}`);
    return devUrl;
  }

  // PRODUÇÃO - SEMPRE usa S3, não importa o formato do input
  const s3BaseUrl = "https://cardnest-tcc.s3.sa-east-1.amazonaws.com";

  // Remove prefixos desnecessários
  let cleanPath = imagePath;

  // Remove /storage/ ou storage/ do início
  if (cleanPath.startsWith("/storage/")) {
    cleanPath = cleanPath.replace("/storage/", "");
  } else if (cleanPath.startsWith("storage/")) {
    cleanPath = cleanPath.replace("storage/", "");
  }

  // Remove barra inicial se existir
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  // Constrói a URL final do S3
  const finalUrl = `${s3BaseUrl}/${cleanPath}`;
  console.log(
    `🔄 PRODUÇÃO - Convertendo para S3: "${imagePath}" -> "${finalUrl}"`
  );

  return finalUrl;
};

/**
 * Função de debug para analisar respostas da API de mensagens
 * @param {Array} messages - Array de mensagens da API
 * @param {string} reportId - ID do report para contexto
 */
export const debugReportMessages = (messages, reportId) => {
  const problematicMessages = messages.filter(
    (msg) => msg.imagem && /^\d+$/.test(msg.imagem.toString())
  );

  const workingMessages = messages.filter(
    (msg) => msg.imagem && !/^\d+$/.test(msg.imagem.toString())
  );

  if (problematicMessages.length > 0) {
    console.group(`🔍 RELATÓRIO DETALHADO - Report ID: ${reportId}`);

    console.log("📊 RESUMO:");
    console.log(`   Total de mensagens: ${messages.length}`);
    console.log(`   ❌ Com problema: ${problematicMessages.length}`);
    console.log(`   ✅ Funcionando: ${workingMessages.length}`);
    console.log(
      `   📝 Sem imagem: ${messages.filter((msg) => !msg.imagem).length}`
    );

    console.log("\n❌ MENSAGENS COM PROBLEMA:");
    problematicMessages.forEach((msg) => {
      console.log(
        `   ID: ${msg.id} | Imagem: "${msg.imagem}" | Data: ${msg.created_at}`
      );
    });

    if (workingMessages.length > 0) {
      console.log("\n✅ MENSAGENS FUNCIONAIS (exemplo):");
      workingMessages.slice(0, 2).forEach((msg) => {
        console.log(`   ID: ${msg.id} | Imagem: "${msg.imagem}"`);
      });
    }

    console.log("\n🎯 AÇÃO NECESSÁRIA NO BACKEND LARAVEL:");
    console.log(
      "   1. Verifique ReportMessageController@store - método que salva mensagens"
    );
    console.log("   2. Verifique Model ReportMessage - campo 'imagem'");
    console.log(
      "   3. Verifique Migration - estrutura da tabela report_messages"
    );
    console.log(
      "   4. O campo 'imagem' deve conter o caminho (ex: 'reports/arquivo.png') e não apenas o ID"
    );

    console.log("\n💡 DICA RÁPIDA:");
    console.log(
      "   Provavelmente o controller está salvando apenas o ID da imagem"
    );
    console.log("   em vez do caminho completo do arquivo no storage.");

    console.groupEnd();
  }
};
