# SISTEMA BACKEND DESCONTINUADO

⚠️ **AVISO: Este sistema backend foi descontinuado em favor do sistema local SQLite.**

## Motivo da Descontinuação

Após análise comparativa entre o sistema backend (Express + JSON) e o sistema local (SQLite), foi determinado que o **sistema local é mais completo e robusto**:

### Sistema Local (SQLite) - ✅ ESCOLHIDO
- ✅ **Persistência real**: Dados salvos em SQLite com transações ACID
- ✅ **Estrutura completa**: Tabelas para projetos, versões, usuários e configurações
- ✅ **Versionamento**: Sistema de versões para projetos
- ✅ **Configurações avançadas**: Suporte completo a todas as opções de configuração
- ✅ **Código integrado**: Salva o código gerado junto com o projeto
- ✅ **Performance**: Acesso direto sem latência de rede
- ✅ **Offline**: Funciona sem conexão com servidor

### Sistema Backend (Express) - ❌ DESCONTINUADO
- ❌ **Persistência limitada**: Apenas JSON em memória
- ❌ **Estrutura básica**: Campos limitados no modelo de projeto
- ❌ **Sem versionamento**: Não suporta histórico de versões
- ❌ **Configurações limitadas**: Não suporta todas as opções avançadas
- ❌ **Sem código**: Não integra o código gerado
- ❌ **Dependência de rede**: Requer servidor ativo
- ❌ **Complexidade**: Adiciona camada desnecessária

## Arquivos Mantidos

Os seguintes arquivos foram mantidos apenas para referência, mas **NÃO devem ser usados**:

- `src/controllers/ProjectController.ts`
- `src/services/ProjectService.ts` 
- `src/repositories/ProjectRepository.ts`
- `src/routes/projects.ts`
- `frontend/src/services/projectService.ts`

## Sistema Atual

O sistema agora usa **exclusivamente** o SQLite local:

- **Frontend**: `frontend/src/services/database.ts`
- **Criação de projetos**: `frontend/src/pages/CreateAppPage.tsx`
- **Listagem de projetos**: `frontend/src/pages/ProjectsPage.tsx`

## Benefícios da Consolidação

1. **Eliminação de duplicação**: Um único sistema de persistência
2. **Redução de complexidade**: Menos código para manter
3. **Melhor performance**: Acesso direto ao banco local
4. **Maior confiabilidade**: SQLite é mais robusto que JSON em memória
5. **Funcionalidades completas**: Suporte a todas as configurações e código gerado

---

**Data da descontinuação**: Janeiro 2025
**Motivo**: Consolidação em sistema local mais robusto e completo