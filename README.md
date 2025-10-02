# Servidor VPS Completo - Multi-Usuário em Tempo Real

Este projeto contém uma estrutura completa para hospedar sua aplicação em um servidor VPS com Docker, incluindo monitoramento, segurança, backup automático e **funcionalidades em tempo real para múltiplos usuários simultâneos**.

## 🚀 Características

- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx com SSL/TLS e suporte a WebSocket
- **Banco de Dados**: PostgreSQL otimizado para alta concorrência
- **Cache**: Redis para sessões e dados em tempo real
- **Tempo Real**: WebSocket com Socket.IO para comunicação instantânea
- **Multi-Usuário**: Suporte a centenas de usuários simultâneos
- **Monitoramento**: Prometheus + Grafana com métricas em tempo real
- **Segurança**: Firewall, Fail2Ban, SSL automático
- **Backup**: Scripts automáticos de backup
- **Logs**: Rotação automática de logs
- **Escalabilidade**: Configurações otimizadas para crescimento

## 📁 Estrutura do Projeto

```
servidor-vps/
├── docker-compose.yml          # Configuração dos containers
├── Dockerfile                  # Imagem da aplicação
├── package.json               # Dependências Node.js
├── server.js                  # Servidor principal
├── routes/
│   └── api.js                 # Rotas da API
├── nginx/
│   ├── nginx.conf             # Configuração principal do Nginx
│   └── conf.d/
│       └── default.conf        # Configuração do servidor
├── monitoring/
│   └── prometheus.yml         # Configuração do Prometheus
├── scripts/
│   ├── deploy.sh              # Script de deploy
│   ├── setup-security.sh      # Configuração de segurança
│   ├── setup-ssl.sh           # Configuração SSL
│   ├── backup.sh              # Script de backup
│   └── health-check.sh        # Verificação de saúde
├── env.example                # Exemplo de variáveis de ambiente
└── README.md                   # Este arquivo
```

## 🛠️ Instalação e Configuração

### 1. Preparação do Servidor

```bash
# Execute no servidor VPS
sudo ./scripts/setup-security.sh
```

### 2. Configuração de Acesso (IMPORTANTE!)

**Você tem 3 opções para acessar seu servidor:**

#### 🌐 **Opção 1: Usar IP do Servidor (Mais Simples)**
```bash
# Configure automaticamente com o IP do servidor
sudo ./scripts/setup-ip.sh
```
- ✅ **Vantagem**: Não precisa de domínio
- ✅ **Acesso**: `http://SEU_IP_DO_VPS`
- ⚠️ **Limitação**: Sem SSL automático (pode usar certificado auto-assinado)

#### 🏠 **Opção 2: Usar Domínio Próprio**
```bash
# Configure manualmente no arquivo .env
cp env.example .env
nano .env
# Altere: DOMAIN=meusite.com
```
- ✅ **Vantagem**: SSL automático com Let's Encrypt
- ✅ **Acesso**: `https://meusite.com`
- 💰 **Custo**: Precisa comprar domínio

#### 🆓 **Opção 3: Usar Domínio Gratuito**
```bash
# Use serviços como No-IP, DuckDNS, etc.
# Configure no arquivo .env
DOMAIN=meusite.ddns.net
```
- ✅ **Vantagem**: Gratuito + SSL possível
- ✅ **Acesso**: `https://meusite.ddns.net`
- ⚠️ **Limitação**: Precisa renovar periodicamente

### 3. Configuração das Variáveis

```bash
# Se não usou o script automático, configure manualmente
cp env.example .env
nano .env
```

### 4. Deploy da Aplicação

```bash
# Execute o deploy
sudo ./scripts/deploy.sh

# Para deploy com limpeza completa
sudo ./scripts/deploy.sh --clean
```

### 5. Configuração SSL (Opcional)

**Se escolheu usar domínio próprio:**
```bash
# Configure SSL com Let's Encrypt
sudo ./scripts/setup-ssl.sh
```

**Se escolheu usar IP ou domínio gratuito:**
```bash
# O script setup-ip.sh já configurou SSL auto-assinado
# Ou configure manualmente se necessário
```

## 🌐 URLs Disponíveis

Após o deploy, você terá acesso a:

### 📱 **Com IP do Servidor:**
- **Aplicação Principal**: `http://SEU_IP_DO_VPS`
- **Interface Web**: `http://SEU_IP_DO_VPS` (página HTML com funcionalidades em tempo real)
- **API REST**: `http://SEU_IP_DO_VPS/api/`
- **WebSocket**: `ws://SEU_IP_DO_VPS/socket.io/`
- **Grafana**: `http://SEU_IP_DO_VPS:3001`
- **Prometheus**: `http://SEU_IP_DO_VPS:9090`

### 🏠 **Com Domínio Próprio:**
- **Aplicação Principal**: `https://meusite.com`
- **Interface Web**: `https://meusite.com`
- **API REST**: `https://meusite.com/api/`
- **WebSocket**: `wss://meusite.com/socket.io/`

### 🆓 **Com Domínio Gratuito:**
- **Aplicação Principal**: `https://meusite.ddns.net`
- **Interface Web**: `https://meusite.ddns.net`

## 📊 Monitoramento

### Grafana
- Acesse: `http://localhost:3001`
- Login: `admin` / Senha configurada no `.env`
- Dashboards pré-configurados para monitorar:
  - Uso de CPU, Memória e Disco
  - Status dos containers
  - Logs da aplicação
  - Métricas de rede

### Prometheus
- Acesse: `http://localhost:9090`
- Coleta métricas de todos os serviços
- Configuração em `monitoring/prometheus.yml`

## 🔒 Segurança

O servidor inclui várias medidas de segurança:

- **Firewall (UFW)**: Configurado para permitir apenas portas necessárias
- **Fail2Ban**: Proteção contra ataques de força bruta
- **SSL/TLS**: Certificados automáticos com Let's Encrypt
- **Rate Limiting**: Proteção contra DDoS
- **Headers de Segurança**: Configurados no Nginx
- **Atualizações Automáticas**: Sistema atualizado automaticamente

## 💾 Backup

### Backup Automático
- Executado diariamente às 2:00 AM
- Inclui: banco de dados, Redis, logs, configurações
- Retenção configurável (padrão: 30 dias)

### Backup Manual
```bash
sudo ./scripts/backup.sh
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers
```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar serviços
docker-compose restart

# Parar todos os serviços
docker-compose down

# Iniciar serviços
docker-compose up -d
```

### Verificação de Saúde
```bash
# Verificar status dos serviços
./scripts/health-check.sh

# Monitoramento específico para múltiplos usuários
./scripts/multi-user-monitor.sh

# Ver logs de saúde
tail -f logs/health-check.log
tail -f logs/multi-user-monitor.log
```

### Logs
```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do Nginx
docker-compose logs -f nginx

# Logs do banco de dados
docker-compose logs -f database
```

## 🚨 Troubleshooting

### Aplicação não está respondendo
1. Verifique se todos os containers estão rodando: `docker-compose ps`
2. Verifique os logs: `docker-compose logs app`
3. Execute verificação de saúde: `./scripts/health-check.sh`

### Problemas de SSL
1. Verifique se o domínio está apontando para o servidor
2. Execute novamente: `sudo ./scripts/setup-ssl.sh`
3. Verifique os logs do Certbot: `journalctl -u certbot`

### Problemas de banco de dados
1. Verifique se o container está rodando: `docker-compose ps database`
2. Verifique os logs: `docker-compose logs database`
3. Teste a conexão: `docker exec postgres_db pg_isready -U postgres`

## 📝 Personalização

### Funcionalidades em Tempo Real
O sistema inclui WebSocket com Socket.IO para:
- Chat em tempo real entre usuários
- Notificações instantâneas
- Sincronização de dados em tempo real
- Lista de usuários conectados
- Estatísticas ao vivo

### Adicionando Novas Rotas
Edite o arquivo `routes/api.js` para adicionar novas rotas da API.

### Modificando Configurações do Nginx
Edite os arquivos em `nginx/` para personalizar o proxy reverso e WebSocket.

### Configurando Alertas
Configure alertas no Grafana para receber notificações sobre problemas.

### Otimizações para Múltiplos Usuários
- PostgreSQL configurado para até 200 conexões simultâneas
- Redis otimizado para sessões e cache
- Rate limiting ajustado para 1000 requests por 15 minutos
- WebSocket com timeout otimizado para conexões longas

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# Fazer backup
sudo ./scripts/backup.sh

# Atualizar código
git pull

# Rebuild e restart
sudo ./scripts/deploy.sh --clean
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs`
2. Execute verificação de saúde: `./scripts/health-check.sh`
3. Consulte a documentação do Docker e Nginx

## 🎯 Casos de Uso Ideais

Este servidor VPS é perfeito para:
- **Sistemas colaborativos** com múltiplos usuários
- **Dashboards em tempo real** com dados compartilhados
- **Chats e comunicação** instantânea
- **Monitoramento** de sistemas e processos
- **Aplicações web** que precisam de alta disponibilidade
- **APIs** que servem múltiplos clientes simultaneamente

## 📈 Capacidades de Performance

- **Usuários simultâneos**: Até 200+ usuários conectados
- **Conexões de banco**: Até 200 conexões PostgreSQL simultâneas
- **Rate limiting**: 1000 requests por IP a cada 15 minutos
- **WebSocket**: Suporte completo com reconexão automática
- **Uptime**: 99.9% com restart automático de containers
- **Escalabilidade**: Fácil expansão horizontal com load balancer

---

**Desenvolvido para hospedar aplicações Node.js de forma segura, escalável e em tempo real em VPS.**
