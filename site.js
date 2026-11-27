(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");

  function fecharMenu() {
    nav.classList.remove("aberto");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Menu";
  }

  btn.addEventListener("click", function () {
    var aberto = nav.classList.toggle("aberto");
    btn.setAttribute("aria-expanded", aberto ? "true" : "false");
    btn.textContent = aberto ? "Fechar" : "Menu";
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") fecharMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharMenu();
  });

  function el(tag, attrs, texto) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (chave) {
        if (chave === "class") node.className = attrs[chave];
        else node.setAttribute(chave, attrs[chave]);
      });
    }
    if (texto != null) node.textContent = texto;
    return node;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function httpsOk(url) {
    return typeof url === "string" && /^https:\/\/\S+$/i.test(url.trim());
  }

  function emailOk(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function dois(n) {
    var s = String(n);
    return s.length < 2 ? "0" + s : s;
  }

  function textoTotal(n) {
    return n + (n === 1 ? " candidato" : " candidatos");
  }

  function aplicarData(texto) {
    ["atualizado-etapas", "atualizado-rodape"].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.textContent = texto || "";
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || "");
      if (m) node.setAttribute("datetime", m[3] + "-" + m[2] + "-" + m[1]);
    });
  }

  function classificar(status) {
    var s = norm(status);
    if (s.indexOf("andamento") !== -1) {
      return { cls: "andamento", chip: "st-andamento", rotulo: "Em andamento" };
    }
    if (s.indexOf("conclu") !== -1) {
      return { cls: "concluida", chip: "st-concluida", rotulo: "Concluído" };
    }
    return { cls: "proxima", chip: "st-proxima", rotulo: "Previsto" };
  }

  function mostrarErro(id) {
    var node = document.getElementById(id);
    if (node) node.hidden = false;
  }

  function carregar(url) {
    return fetch(url, { cache: "no-cache" }).then(function (resposta) {
      if (!resposta.ok) throw new Error(url);
      return resposta.json();
    });
  }

  function renderCronograma(dados) {
    var etapas = Array.isArray(dados) ? dados : (dados && dados.etapas) || [];
    var atualizado = !Array.isArray(dados) && dados ? dados.atualizado : "";
    aplicarData(atualizado || "");
    var lista = document.getElementById("timeline");
    lista.textContent = "";
    etapas.forEach(function (etapa) {
      if (!etapa || !etapa.etapa) return;
      var info = classificar(etapa.status);
      var li = el("li", { class: info.cls });
      if (info.cls === "andamento") li.setAttribute("aria-current", "step");
      li.appendChild(el("span", { class: "marco", "aria-hidden": "true" }));
      var topo = el("div", { class: "etapa-topo" });
      topo.appendChild(el("h3", null, etapa.etapa));
      li.appendChild(topo);
      li.appendChild(el("p", { class: "etapa-data" }, etapa.data || ""));
      li.appendChild(el("span", { class: "chip " + info.chip }, info.rotulo));
      if (etapa.obs) li.appendChild(el("p", { class: "etapa-obs" }, etapa.obs));
      lista.appendChild(li);
    });
  }

  function rotuloSite(url) {
    return url.replace(/^https:\/\//i, "").replace(/\/$/, "");
  }

  function rotuloRede(rede) {
    var tipo = String(rede.tipo || "").toLowerCase();
    var url = rede.url || "";
    if (tipo === "instagram") return "Instagram";
    if (tipo === "linkedin" && /\/company\//i.test(url)) return "LinkedIn empresa";
    if (tipo === "linkedin") return "LinkedIn";
    return "";
  }

  function renderCandidatos(listaDados) {
    var dados = Array.isArray(listaDados) ? listaDados : [];
    var ul = document.getElementById("lista");
    var contagem = document.getElementById("contagem");
    var vazio = document.getElementById("vazio");
    var campo = document.getElementById("q");
    var totalNode = document.getElementById("n-candidatos");
    ul.textContent = "";
    var itens = [];

    dados.forEach(function (c, i) {
      if (!c || !c.nome) return;
      var li = el("li", { class: "cand" });
      var numero = c.n != null ? c.n : i + 1;
      li.appendChild(el("span", { class: "n" }, dois(numero)));
      li.appendChild(el("span", { class: "emp" }, c.nome));
      var links = el("span", { class: "links" });
      var tem = false;
      if (httpsOk(c.site)) {
        tem = true;
        var site = el("a", {
          class: "site",
          href: c.site.trim(),
          target: "_blank",
          rel: "noopener noreferrer"
        }, rotuloSite(c.site.trim()));
        links.appendChild(site);
      }
      (c.redes || []).forEach(function (rede) {
        if (!rede || !httpsOk(rede.url)) return;
        var rotulo = rotuloRede(rede);
        if (!rotulo) return;
        tem = true;
        var a = el("a", {
          class: "rede",
          href: rede.url.trim(),
          target: "_blank",
          rel: "noopener noreferrer"
        }, rotulo);
        a.setAttribute("aria-label", rotulo + " de " + c.nome);
        links.appendChild(a);
      });
      if (!tem) li.classList.add("so-nome");
      li.appendChild(links);
      li.dataset.busca = norm(c.nome);
      ul.appendChild(li);
      itens.push(li);
    });

    var total = itens.length;
    if (totalNode) totalNode.textContent = String(total);

    function filtrar() {
      var termo = norm(campo.value);
      var visiveis = 0;
      itens.forEach(function (li) {
        var ok = !termo || li.dataset.busca.indexOf(termo) !== -1;
        li.hidden = !ok;
        if (ok) {
          visiveis += 1;
          li.classList.toggle("par", visiveis % 2 === 0);
        }
      });
      vazio.hidden = visiveis !== 0;
      contagem.textContent = termo
        ? "Mostrando " + visiveis + " de " + textoTotal(total)
        : textoTotal(total);
    }

    campo.addEventListener("input", filtrar);
    filtrar();
  }

  function montarFormulario(id, url, embed, rotulo, tituloFrame) {
    var painel = document.getElementById(id);
    painel.textContent = "";
    var acoes = el("div", { class: "acoes" });
    if (httpsOk(url)) {
      var link = el("a", {
        class: "btn btn-pri",
        href: url.trim(),
        target: "_blank",
        rel: "noopener noreferrer"
      }, rotulo);
      acoes.appendChild(link);
    } else {
      var desativado = el("button", { class: "btn btn-pri", type: "button" }, "em breve");
      desativado.disabled = true;
      acoes.appendChild(desativado);
    }
    painel.appendChild(acoes);
    if (httpsOk(embed)) {
      painel.appendChild(el("p", { class: "embed-nota" }, "O botão abre o formulário do Google. Abaixo, a mesma página incorporada."));
      var frame = el("iframe", {
        class: "embed",
        title: tituloFrame
      });
      frame.dataset.src = embed.trim();
      painel.appendChild(frame);
      carregarEmbed(frame);
    }
  }

  function carregarEmbed(frame) {
    function ativar() {
      if (frame.getAttribute("src")) return;
      frame.setAttribute("src", frame.dataset.src);
    }
    if (!("IntersectionObserver" in window)) {
      ativar();
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        ativar();
        obs.disconnect();
      });
    }, { rootMargin: "240px" });
    obs.observe(frame);
  }

  function renderConfig(config) {
    config = config || {};
    montarFormulario(
      "painel-sugestoes",
      config.formSugestoesUrl,
      config.formSugestoesEmbed,
      "Enviar sugestão",
      "Formulário de sugestões"
    );
    montarFormulario(
      "painel-indicacao",
      config.formIndicacaoUrl,
      config.formIndicacaoEmbed,
      "Enviar indicação",
      "Formulário de indicação"
    );

    var docs = Array.isArray(config.documentos) ? config.documentos : [];
    var caixa = document.getElementById("docs");
    var aviso = document.getElementById("docs-vazio");
    caixa.textContent = "";
    var publicados = docs.filter(function (doc) {
      return doc && doc.titulo && httpsOk(doc.url);
    });
    aviso.hidden = publicados.length > 0;
    publicados.forEach(function (doc) {
      var link = el("a", {
        class: "doc",
        href: doc.url.trim(),
        target: "_blank",
        rel: "noopener noreferrer"
      });
      var ext = /\.pdf(\?|$)/i.test(doc.url) ? "PDF" : "ARQ";
      link.appendChild(el("span", { class: "doc-ico", "aria-hidden": "true" }, ext));
      var bloco = el("div");
      bloco.appendChild(el("h3", null, doc.titulo));
      bloco.appendChild(el("span", { class: "doc-acao" }, "Abrir documento"));
      link.appendChild(bloco);
      caixa.appendChild(link);
    });

    var contato = config.contato || {};
    var nome = contato.nome || "Mori";
    document.getElementById("contato-titulo").textContent = "Fale com " + nome;
    var unidade = contato.unidade ? "Morador da unidade " + contato.unidade + ". " : "";
    document.getElementById("contato-texto").textContent = unidade + "Dúvidas sobre a seleção podem ser enviadas diretamente.";

    var acoes = document.getElementById("contato-acoes");
    var linhas = document.getElementById("contato-dados");
    acoes.textContent = "";
    linhas.textContent = "";

    if (httpsOk(contato.whatsappUrl)) {
      acoes.appendChild(el("a", {
        class: "btn btn-pri",
        href: contato.whatsappUrl.trim(),
        target: "_blank",
        rel: "noopener noreferrer"
      }, "Conversar no WhatsApp"));
    }
    if (emailOk(contato.email)) {
      acoes.appendChild(el("a", {
        class: "btn btn-sec",
        href: "mailto:" + contato.email.trim()
      }, "Enviar e-mail"));
    }

    function linha(rotulo, valor, href) {
      if (!valor) return;
      var grupo = el("div");
      grupo.appendChild(el("dt", null, rotulo));
      var dd = el("dd");
      if (href) dd.appendChild(el("a", { href: href }, valor));
      else dd.textContent = valor;
      grupo.appendChild(dd);
      linhas.appendChild(grupo);
    }

    if (httpsOk(contato.whatsappUrl)) {
      linha("WhatsApp", contato.whatsapp || contato.whatsappUrl, contato.whatsappUrl.trim());
    }
    if (emailOk(contato.email)) {
      linha("E-mail", contato.email.trim(), "mailto:" + contato.email.trim());
    }
    linha("Unidade", contato.unidade || "", "");
  }

  carregar("data/cronograma.json").then(renderCronograma).catch(function () {
    mostrarErro("erro-etapas");
  });

  carregar("data/candidatos.json").then(renderCandidatos).catch(function () {
    mostrarErro("erro-candidatos");
    var contagem = document.getElementById("contagem");
    if (contagem) contagem.textContent = "";
  });

  carregar("data/config.json").then(renderConfig).catch(function () {
    montarFormulario("painel-sugestoes", "", "", "Enviar sugestão", "");
    montarFormulario("painel-indicacao", "", "", "Enviar indicação", "");
  });
})();
