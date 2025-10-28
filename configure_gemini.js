// Script para configurar a API key do Gemini no banco de dados
const apiKey = "AIzaSyB6aUCnTMZLiynNomgp470idNmyMMsP06w";

// Simular a configuração no localStorage (como o banco SQLite usa)
const dbData = {
  settings: [
    {
      key: "geminiApiKey",
      value: apiKey,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      key: "geminiModel", 
      value: "gemini-2.5-flash",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

console.log("Configuração que será aplicada:");
console.log(JSON.stringify(dbData, null, 2));
console.log("\nPara aplicar esta configuração:");
console.log("1. Abra o navegador em http://localhost:3011");
console.log("2. Abra as ferramentas de desenvolvedor (F12)");
console.log("3. Vá para a aba Console");
console.log("4. Execute o seguinte código:");
console.log(`
// Configurar API key no banco de dados
(async () => {
  const { database } = await import('./src/services/database.ts');
  await database.setSetting('geminiApiKey', '${apiKey}');
  await database.setSetting('geminiModel', 'gemini-2.5-flash');
  console.log('✅ API key configurada com sucesso!');
  
  // Recarregar o serviço Gemini
  const { geminiService } = await import('./src/services/gemini.ts');
  await geminiService.reload();
  console.log('✅ Serviço Gemini recarregado!');
  
  // Verificar status
  const status = await geminiService.checkApiStatus();
  console.log('📊 Status da API:', status);
})();
`);