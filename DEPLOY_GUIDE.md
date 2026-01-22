# 🚀 Guia de Deploy - Controle Financeiro Familiar

## Opção 1: Deploy no Netlify (Recomendado)

### Método A: Drag & Drop (Mais Fácil)

1. Acesse [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste toda a pasta `/simplesfinanceiro` para a área indicada
3. Aguarde o upload (leva alguns segundos)
4. Seu site estará online em um URL temporário
5. Customize o nome do site em "Site Settings"

### Método B: GitHub + Netlify (Recomendado para Manutenção)

#### Passo 1: Criar Repositório no GitHub
```bash
cd /home/ubuntu/simplesfinanceiro
git init
git add .
git commit -m "Initial commit: Controle Financeiro Familiar PWA"
git branch -M main
git remote add origin https://github.com/seu-usuario/simplesfinanceiro.git
git push -u origin main
```

#### Passo 2: Conectar no Netlify
1. Acesse [https://app.netlify.com](https://app.netlify.com)
2. Clique em "New site from Git"
3. Selecione GitHub e autorize
4. Escolha o repositório `simplesfinanceiro`
5. Configure:
   - Build command: (deixe vazio - é site estático)
   - Publish directory: `.` (raiz do projeto)
6. Clique em "Deploy site"

#### Passo 3: Configurar Domínio Customizado
1. Em "Site Settings" → "Domain management"
2. Clique em "Add custom domain"
3. Digite seu domínio (ex: finanças.com.br)
4. Siga as instruções para apontar o DNS

### Método C: Deploy Manual (Avançado)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
cd /home/ubuntu/simplesfinanceiro
netlify deploy --prod
```

---

## Opção 2: Deploy em Outro Servidor

### Vercel
1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe do GitHub ou faça upload
4. Deploy automático

### GitHub Pages
```bash
# Criar branch gh-pages
git checkout --orphan gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Ativar em Settings → Pages
```

### Servidor Próprio (Apache/Nginx)
```bash
# Copiar arquivos para o servidor
scp -r /home/ubuntu/simplesfinanceiro/* usuario@seu-servidor:/var/www/html/

# Configurar headers (nginx)
add_header Cache-Control "public, max-age=31536000, immutable" always;
add_header X-Content-Type-Options "nosniff" always;
```

---

## ✅ Checklist Pré-Deploy

- [ ] Todos os arquivos estão presentes:
  - [ ] `index.html`
  - [ ] `app.js`
  - [ ] `style.css`
  - [ ] `manifest.json`
  - [ ] `service-worker.js`
  - [ ] `browserconfig.xml`
  - [ ] `netlify.toml`
  - [ ] Pasta `icons/` com todos os ícones

- [ ] Testou no navegador localmente?
- [ ] Testou no mobile (Android/iOS)?
- [ ] Verificou se o PWA instala corretamente?
- [ ] Testou offline (abra DevTools → Application → Service Workers)?

---

## 🔍 Verificar Deploy

### Teste de PWA
1. Acesse seu site pelo navegador
2. Abra DevTools (F12)
3. Vá para "Application" → "Manifest"
4. Verifique se aparece o manifest.json
5. Vá para "Service Workers"
6. Verifique se o service worker está registrado

### Teste de Instalação
**Android (Chrome):**
1. Toque no menu (⋮)
2. Toque em "Instalar app"
3. Confirme

**iOS (Safari):**
1. Toque em Compartilhar (□↑)
2. Toque em "Adicionar à Tela de Início"
3. Confirme

### Teste Offline
1. Abra o site
2. Desconecte a internet (ou use DevTools: Throttling → Offline)
3. Recarregue a página
4. O site deve continuar funcionando

---

## 🐛 Troubleshooting

### Service Worker não registra
- Verifique se o site está em HTTPS (PWA requer HTTPS)
- Limpe o cache do navegador
- Verifique o console (F12 → Console) para erros

### Ícone não aparece
- Verifique se os arquivos estão em `icons/`
- Limpe o cache do navegador
- Verifique o manifest.json

### Dados não salvam
- Verifique se o LocalStorage está habilitado
- Tente limpar dados do site e recarregar
- Verifique o console para erros

### PWA não instala
- Verifique se está em HTTPS
- Verifique se o manifest.json é válido
- Verifique se o service worker está registrado
- Aguarde alguns segundos antes de tentar instalar novamente

---

## 📊 Monitoramento Pós-Deploy

### Google Lighthouse
1. Abra DevTools (F12)
2. Vá para "Lighthouse"
3. Clique em "Analyze page load"
4. Verifique os scores (PWA, Performance, Accessibility)

### Google Search Console
1. Acesse [https://search.google.com/search-console](https://search.google.com/search-console)
2. Adicione seu site
3. Envie o sitemap (opcional para site estático)

### Monitoramento de Uptime
- [UptimeRobot](https://uptimerobot.com) - Gratuito
- [StatusCake](https://www.statuscake.com) - Gratuito

---

## 🔐 Segurança

### HTTPS
- Netlify fornece HTTPS grátis automaticamente
- Outros servidores: use Let's Encrypt (gratuito)

### Headers de Segurança
Já configurados em `netlify.toml`:
- `X-Frame-Options: DENY` - Previne clickjacking
- `X-Content-Type-Options: nosniff` - Previne MIME sniffing
- `Referrer-Policy: no-referrer-when-downgrade` - Privacidade

### Backup de Dados
Os dados são salvos localmente no navegador do usuário. Para backup:
1. Abra DevTools (F12)
2. Vá para "Application" → "LocalStorage"
3. Copie o valor de `controleFinanceiroData`
4. Salve em um arquivo seguro

---

## 📱 Distribuição

### Android
1. Seu PWA pode ser distribuído via Google Play Store
2. Use ferramentas como [PWA Builder](https://www.pwabuilder.com)
3. Gere APK/AAB a partir do PWA

### iOS
1. PWA no iOS funciona via Safari
2. Usuários adicionam à tela inicial
3. Não há distribuição via App Store para PWA puro (ainda)

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique o console do navegador (F12 → Console)
2. Verifique o arquivo `README.md`
3. Consulte a documentação do Netlify: [docs.netlify.com](https://docs.netlify.com)

---

**Sucesso no deploy! 🎉**
