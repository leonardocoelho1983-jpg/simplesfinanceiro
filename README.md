# 💰 Controle Financeiro Familiar

Aplicativo web progressivo (PWA) para controle financeiro pessoal e familiar, com previsão orçamentária anual e acompanhamento mensal detalhado.

## ✨ Funcionalidades

- **Previsão Orçamentária Anual**: Defina valores previstos para receitas, despesas, cartões de crédito e investimentos
- **Acompanhamento Mensal**: Compare valores previstos vs realizados mês a mês
- **Gestão de Cartões de Crédito**: Controle detalhado de parcelas e faturas
- **Cálculo Automático**: Totalizadores e saldos calculados automaticamente
- **Sistema de Confirmação**: Marque itens como confirmados para diferenciar previsão de realizado
- **PWA Completo**: Funciona offline, instalável em Android e iOS
- **Responsivo**: Interface otimizada para mobile, tablet e desktop

## 🚀 Instalação

### Como PWA (Recomendado)

#### Android (Chrome/Edge)
1. Acesse o site pelo navegador
2. Toque no menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"
3. Confirme a instalação
4. O app aparecerá na tela inicial como um aplicativo nativo

#### iOS (Safari)
1. Acesse o site pelo Safari
2. Toque no botão de compartilhar (□↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme e o app aparecerá na tela inicial

#### Desktop (Chrome/Edge)
1. Acesse o site pelo navegador
2. Clique no ícone de instalação (➕) na barra de endereço
3. Ou vá em Menu → "Instalar Controle Financeiro Familiar"

## 📦 Deploy no Netlify

### Método 1: Drag & Drop
1. Acesse [Netlify Drop](https://app.netlify.com/drop)
2. Arraste toda a pasta do projeto
3. Pronto! Seu site estará online

### Método 2: GitHub/Git
1. Faça push do código para um repositório Git
2. Conecte o repositório no Netlify
3. Configure o build (não necessário, é site estático)
4. Deploy automático a cada commit

### Configuração Recomendada
Crie um arquivo `netlify.toml` na raiz:

```toml
[build]
  publish = "."

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
```

## 🔧 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Framework CSS**: Bootstrap 5.3.3
- **PWA**: Service Worker com estratégia de cache otimizada
- **Armazenamento**: LocalStorage (dados salvos localmente no dispositivo)
- **Ícones**: Múltiplos tamanhos (72x72 até 512x512) + versões maskable

## 📱 Compatibilidade

- ✅ Android 5.0+ (Chrome, Edge, Firefox)
- ✅ iOS 11.3+ (Safari)
- ✅ Desktop (Chrome, Edge, Firefox, Safari)
- ✅ Funciona 100% offline após primeira visita

## 🐛 Correções Implementadas

### Versão 2.0 (Atual)
- ✅ **Bug crítico corrigido**: Erro `dataset.category-type` que causava repetição da previsão nos meses
- ✅ **Ícones PWA**: Criados todos os tamanhos necessários (72x72 até 512x512)
- ✅ **Responsividade mobile**: Layout totalmente otimizado para telas pequenas
- ✅ **Service Worker melhorado**: Estratégia de cache otimizada com fallback offline
- ✅ **Meta tags PWA**: Suporte completo para iOS e Android
- ✅ **Acessibilidade**: Melhorias de contraste e navegação por teclado
- ✅ **Performance**: Animações suaves e transições otimizadas

## 📝 Como Usar

### 1. Previsão Anual
- Acesse a aba "Previsão Anual"
- Preencha os valores previstos para cada categoria
- Para cartões de crédito, adicione itens com descrição, parcelas e valores
- Clique em "Salvar Previsão" para propagar aos meses

### 2. Acompanhamento Mensal
- Clique no botão do mês desejado (Jan, Fev, Mar, etc.)
- Os valores da previsão aparecerão automaticamente
- Edite os valores reais conforme necessário
- Marque o checkbox ✓ para confirmar cada item
- Clique em "Salvar Dados do Mês"

### 3. Cartões de Crédito
- Adicione itens de cartão com descrição (ex: "Netflix")
- Informe as parcelas (ex: "1/12" ou "À vista")
- Valor mensal: parcela que será paga no mês
- Valor falta: saldo restante das parcelas

## 💾 Dados

Todos os dados são salvos localmente no navegador usando LocalStorage. Isso significa:
- ✅ Privacidade total (dados não saem do seu dispositivo)
- ✅ Funciona offline
- ⚠️ Limpar cache do navegador apaga os dados
- ⚠️ Dados não sincronizam entre dispositivos

### Backup Manual
Para fazer backup dos dados:
1. Abra o Console do navegador (F12)
2. Digite: `localStorage.getItem('controleFinanceiroData')`
3. Copie o texto e salve em um arquivo

Para restaurar:
1. Abra o Console
2. Digite: `localStorage.setItem('controleFinanceiroData', 'COLE_AQUI_O_BACKUP')`

## 🎨 Personalização

### Cores
Edite as variáveis no `style.css`:
- `#4CAF50`: Verde principal
- `#388E3C`: Verde escuro
- `#f4f7f6`: Fundo claro

### Categorias
Edite o array `CATEGORIES` no `app.js` para adicionar/remover categorias.

## 📄 Licença

Projeto de uso pessoal. Sinta-se livre para adaptar às suas necessidades.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se está usando a versão mais recente
2. Limpe o cache do navegador
3. Reinstale o PWA

---

**Desenvolvido com ❤️ para controle financeiro familiar**
