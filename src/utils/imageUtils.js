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
  if (typeof imagePath === "string" && imagePath.length > 0) {
    console.log(`🖼️ DEBUG getImageUrl: Recebido "${imagePath}"`);
  }

  // Se já é uma URL completa (S3 ou outro CDN), retorna como está
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    console.log(`✅ URL completa detectada: ${imagePath}`);
    return imagePath;
  }

  // Detecta automaticamente o ambiente baseado na mesma lógica do axios_client
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // Obtém a URL base do backend/storage de forma consistente
  const getBackendBaseUrl = () => {
    if (isProduction) {
      // Em produção, as imagens são servidas diretamente do S3
      return "https://cardnest-tcc.s3.sa-east-1.amazonaws.com";
    } else {
      // Em desenvolvimento, usa localhost
      return "http://localhost:8000";
    }
  };

  const backendBaseUrl = getBackendBaseUrl();

  console.log(`🌍 Ambiente: ${isProduction ? "PRODUÇÃO" : "DESENVOLVIMENTO"}`);
  console.log(`🔗 Base URL: ${backendBaseUrl}`);

  if (!isProduction) {
    // DESENVOLVIMENTO LOCAL - usa a URL do Laravel
    // Se imagePath é apenas um número (ID da imagem), isso indica um problema no backend
    if (/^\d+$/.test(imagePath.toString())) {
      // Só loga uma vez por ID para evitar spam
      if (!loggedIds.has(imagePath)) {
        console.error(
          `❌ PROBLEMA BACKEND: Campo 'imagem' retornou apenas ID (${imagePath}) em vez do caminho do arquivo. Verifique o controller/model da API.`
        );
        loggedIds.add(imagePath);
      }
      return null; // Retorna null para evitar URLs inválidas
    }

    // Remove a barra inicial se existir para evitar URLs duplas
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${backendBaseUrl}/storage/${cleanPath}`;
  }

  // PRODUÇÃO - as imagens devem vir com URL completa do S3
  // Se for apenas um ID numérico em produção, tentamos construir a URL
  if (/^\d+$/.test(imagePath.toString())) {
    if (!loggedIds.has(imagePath)) {
      console.warn(
        `⚠️ PRODUÇÃO: Recebido ID (${imagePath}) em vez de URL do S3. Tentando construir URL baseada no S3.`
      );
      console.log(`🔧 S3 URL base: ${backendBaseUrl}`);
      loggedIds.add(imagePath);
    }

    // Em produção, as imagens estão no S3 no padrão reports/messages/
    // Mas como só temos o ID, tentamos construir baseado no padrão observado
    return `${backendBaseUrl}/reports/messages/${imagePath}`;
  }

  // Se não for um ID, mas for um caminho relativo, completamos com a URL base do S3
  if (!imagePath.startsWith("http") && !imagePath.startsWith("/")) {
    // Se começa com "storage/", é um caminho do Laravel - em produção deve ir para o S3
    if (imagePath.startsWith("storage/")) {
      if (isProduction) {
        // Em produção, remove "storage/" e mapeia para o padrão correto do S3
        const s3Path = imagePath.replace("storage/", "");
        // Para reports, o padrão no S3 mantém a estrutura: reports/messages/arquivo.png
        if (s3Path.startsWith("reports/messages/")) {
          const finalUrl = `${backendBaseUrl}/${s3Path}`;
          console.log(
            `🔄 Convertendo storage para S3: ${imagePath} -> ${finalUrl}`
          );
          return finalUrl;
        }
        const finalUrl = `${backendBaseUrl}/${s3Path}`;
        console.log(
          `🔄 Convertendo storage para S3: ${imagePath} -> ${finalUrl}`
        );
        return finalUrl;
      } else {
        // Em desenvolvimento, mantém o padrão storage/
        return `${backendBaseUrl}/${imagePath}`;
      }
    }

    // Se já tem um padrão como "reports/arquivo.png", usa direto
    if (imagePath.includes("/")) {
      return `${backendBaseUrl}/${imagePath}`;
    }
    // Se é só o nome do arquivo, assume que está na pasta reports/messages (padrão dos reports)
    return `${backendBaseUrl}/reports/messages/${imagePath}`;
  }

  // Se começar com /, construimos a URL completa
  if (imagePath.startsWith("/")) {
    // Se é /storage/ em produção, mapeia para S3
    if (imagePath.startsWith("/storage/") && isProduction) {
      const s3Path = imagePath.replace("/storage/", "");
      // Para reports, o padrão no S3 mantém a estrutura: reports/messages/arquivo.png
      if (s3Path.startsWith("reports/messages/")) {
        const finalUrl = `${backendBaseUrl}/${s3Path}`;
        console.log(
          `🔄 Convertendo /storage para S3: ${imagePath} -> ${finalUrl}`
        );
        return finalUrl;
      }
      const finalUrl = `${backendBaseUrl}/${s3Path}`;
      console.log(
        `🔄 Convertendo /storage para S3: ${imagePath} -> ${finalUrl}`
      );
      return finalUrl;
    }

    if (isProduction) {
      // Em produção, remove a barra inicial e usa o S3
      return `${backendBaseUrl}${imagePath}`;
    } else {
      // Em desenvolvimento, usa o storage local
      return `${backendBaseUrl}${imagePath}`;
    }
  }

  return imagePath;
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
