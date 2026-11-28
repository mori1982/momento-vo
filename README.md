# momento-vo

Site de transparência da seleção do novo síndico profissional do Condomínio Momento Vila Olímpia (Av. Dr. Cardoso de Melo, 585, São Paulo).

É uma página estática, em português, sem framework e sem etapa de build. Os moradores abrem pelo WhatsApp. Não há rastreadores nem cookies do site. Os formulários de sugestão e de indicação são do Google e abrem só quando a pessoa clica ou chega nessa parte da página.

As fontes Cormorant Garamond e Source Sans 3 estão em `fonts/`, sob a licença SIL Open Font License.

O conteúdo que muda com o tempo está em `data/`. Dá para atualizar pelo site do GitHub, sem instalar nada.

## Ver no computador

Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Abra [http://localhost:8000](http://localhost:8000).

Não abra o `index.html` direto no navegador (`file://`). Nesse modo o navegador bloqueia a leitura dos JSON e a lista fica vazia.

## Atualizar pelo GitHub

1. Abra o repositório no GitHub.
2. Entre na pasta `data` e no arquivo que quer mudar.
3. Clique no lápis (**Edit this file**).
4. Edite o texto. Cuidado com vírgulas e aspas: é JSON.
5. Em **Commit changes**, deixe marcado **Commit directly to the `main` branch** e confirme.
6. O GitHub Pages publica sozinho em alguns minutos. No celular, atualize a página.

A data que aparece em **Atualizado em** é o campo `atualizado` de `data/cronograma.json`, no formato `DD/MM/AAAA`. Ela também vai para o rodapé. Troque esse campo sempre que publicar uma mudança.

### Cronograma

Arquivo: `data/cronograma.json`

```json
{
  "atualizado": "27/11/2026",
  "etapas": [
    {
      "etapa": "Nome da etapa",
      "data": "01/12/2026",
      "status": "previsto",
      "obs": ""
    }
  ]
}
```

`status` só aceita um destes três valores:

| Valor no JSON | O que aparece |
|---|---|
| `concluído` | Concluído |
| `em andamento` | Em andamento, em destaque |
| `previsto` | Previsto |

`obs` pode ficar `""`. A frase "Datas previstas, sujeitas a ajuste" já está na página.

### Candidatos

Arquivo: `data/candidatos.json`

A página mostra só o nome, o site e a rede social. Quem não tiver site nem rede aparece só com o nome. O contador ("31 candidatos") é calculado deste arquivo.

```json
{
  "n": 32,
  "nome": "Nome da empresa ou do síndico",
  "site": "https://exemplo.com.br",
  "redes": [
    { "tipo": "instagram", "url": "https://instagram.com/exemplo" },
    { "tipo": "linkedin", "url": "https://www.linkedin.com/company/exemplo" }
  ]
}
```

- `site` é a URL completa, com `https://`. Se não houver site, use `""`.
- `redes` é uma lista. Se não houver rede, use `[]`.
- `tipo` é só `instagram` ou `linkedin`.
- Só coloque link quando existir um @ ou um caminho concreto (`/in/...` ou `/company/...`). Texto vago, como "LinkedIn pessoal" ou "LinkedIn da empresa", não vira link.
- Não coloque região, status, preço, avaliação nem texto de análise.

### Formulários

Arquivo: `data/config.json`

| Campo | Uso |
|---|---|
| `formSugestoesUrl` | Botão **Enviar sugestão**. Use o link curto `https://forms.gle/...` |
| `formIndicacaoUrl` | Botão **Indicar um síndico**. Use o link curto `https://forms.gle/...` |

Cada seção tem só um texto curto e um botão que abre o Google Form em nova aba. Não há iframe nem página incorporada.

### Documentos

No mesmo `data/config.json`, o campo `documentos` lista os arquivos públicos. A URL pode ser um caminho local (`docs/...`) ou um link `https`.

```json
"documentos": [
  {
    "titulo": "Questionário de seleção (minuta em aprovação)",
    "url": "docs/questionario-selecao-sindico.pdf",
    "texto": "Quem quiser propor perguntas pode usar o formulário de sugestões."
  }
]
```

### Contato

Também em `data/config.json`, no objeto `contato`: `nome` (use **Gustavo Mori**), `unidade`, `whatsapp` (texto), `whatsappUrl` (link `https://wa.me/...`) e `email`. O nome no site é um link para o WhatsApp.

### Grupo de voluntários

Arquivo: `data/voluntarios.json`. Cada pessoa tem `nome`, `apto` e, se houver, `papel`. Só quem tiver contato público leva `whatsapp`, `whatsappUrl` e `email`.

## Publicar no GitHub Pages

O site é publicado pelo GitHub Pages em modo legado, a partir da branch `main` na raiz do repositório. O arquivo `CNAME` contém `sindico.momento-vo.com.br`. Não use um workflow do Actions para o deploy: o Pages está no modo legado e o workflow anterior falhava.
4. Depois do merge na `main`, a execução **Publicar no GitHub Pages** aparece na aba **Actions**.
5. Em **Settings → Pages**, o domínio personalizado deve ficar `momento-vo.com.br`.
6. Quando o certificado existir, marque **Enforce HTTPS**.

Não é preciso gerar o site na mão. Não há `npm install` nem pasta de build.

## DNS na GoDaddy

O domínio `momento-vo.com.br` aponta para o GitHub Pages. No DNS da GoDaddy, em **momento-vo.com.br**:

Apague A, AAAA ou CNAME antigos de `@` e de `www` que mandem o site para outro lugar (página de estacionamento, por exemplo). Não mexa em MX, TXT de e-mail ou outros registros que não sejam do site.

Crie estes registros:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `mori1982.github.io` |

O CNAME de `www` é só `mori1982.github.io`, sem `https://` e sem `/momento-vo`.

A propagação pode levar algumas horas. Quando `https://sindico.momento-vo.com.br` abrir, volte em **Settings → Pages** e marque **Enforce HTTPS**.
