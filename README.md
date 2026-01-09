# PureWeb AdBlocker (1nk.xyz) - Enterprise Core v1.3

PureWeb é uma solução de engenharia de alto nível para navegadores Chromium, consolidada para oferecer resiliência absoluta e compatibilidade máxima. Esta versão v1.3 representa a maturidade do projeto, focado em ser uma camada de compatibilidade invisível e indetectável.

## 🏗️ Engenharia de Resiliência (1nk.xyz)

### 1. Normalização Determinística
O motor de normalização (`inject.js`) foi reescrito para garantir que o ambiente JavaScript permaneça coerente. 
- **Mocks Herméticos**: O uso de `Proxy` garante que objetos de terceiros (Ads/Trackers) existam com propriedades e métodos esperados, mas sem funcionalidade real.
- **Integridade de APIs**: Implementamos proteções para `Object.prototype.toString` e verificações de `instanceof`, tornando os mocks indistinguíveis de objetos nativos.

### 2. Matriz de Compatibilidade Adaptativa
Introduzimos a **Orquestração Determinística** no `background.js`:
- **Auto-Relax**: O sistema identifica automaticamente domínios críticos (Streaming, Finanças, Autenticação) e aplica um perfil de relaxamento de regras em tempo real.
- **Whitelist de Alta Prioridade**: Regras dinâmicas de prioridade 10 garantem que o usuário sempre tenha a última palavra sobre domínios específicos.

### 3. Engine Visual de Alta Fidelidade
O `content.js` agora prioriza a **preservação do layout**:
- **Mitigação de CLS**: As técnicas de ocultação minimizam o *Cumulative Layout Shift*, garantindo que os sites não "pulem" durante o carregamento.
- **Heurística de Contexto**: A filtragem vai além de IDs estáticos, analisando atributos e estruturas do DOM de forma eficiente.

## 📂 Organização do Produto (1nk.xyz)
```text
PureWeb/
├── rules/             # Matriz de regras estáticas (Ads, Trackers, Social)
├── popup/             # Dashboard Executivo (UX Premium)
├── background.js      # Orquestrador Central (Logic Core)
├── content.js         # Engine de Filtragem Visual (High-Fidelity)
├── inject.js          # Camada de Normalização (Environment Layer)
└── manifest.json      # Configuração Segura Manifest V3
```

## 🔐 Compromisso com a Engenharia
- **Privacidade por Design**: Zero coleta, zero telemetria, zero comunicação externa.
- **Performance**: Otimizado para latência zero e baixo consumo de recursos.
- **Transparência**: Código totalmente documentado em Português e auditável.

---
**Engenharia Superior para uma Web Livre. (1nk.xyz)**
