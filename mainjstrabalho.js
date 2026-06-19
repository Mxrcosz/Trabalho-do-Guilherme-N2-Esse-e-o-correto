var agenda = {
  contatos:       [],
  indiceEditando: -1,
  proximoId:      1
};

function salvarContato() {
  var nome       = document.getElementById("nome").value.trim();
  var telefone   = document.getElementById("telefone").value.trim();
  var email      = document.getElementById("email").value.trim();
  var nascimento = document.getElementById("nascimento").value;
  var endereco   = document.getElementById("endereco").value.trim();
  var obs        = document.getElementById("obs").value.trim();

  if (nome === "" || telefone === "") {
    mostrarMensagem("Nome e telefone são obrigatórios!", "erro");
    return;
  }

  if (email !== "" && !email.includes("@")) {
    mostrarMensagem("Digite um e-mail válido!", "erro");
    return;
  }

  var contato = {
    id:          agenda.proximoId,
    nome:        nome,
    telefone:    telefone,
    email:       email,
    nascimento:  nascimento,
    endereco:    endereco,
    obs:         obs,
    dataCriacao: new Date().toISOString()
  };

  if (agenda.indiceEditando !== -1) {
    contato.id          = agenda.contatos[agenda.indiceEditando].id;
    contato.dataCriacao = agenda.contatos[agenda.indiceEditando].dataCriacao;
    agenda.contatos[agenda.indiceEditando] = contato;
    mostrarMensagem("Contato atualizado com sucesso!", "sucesso");
  } else {
    agenda.contatos.push(contato);
    agenda.proximoId++;
    mostrarMensagem("Contato adicionado com sucesso!", "sucesso");
  }

  limparFormulario();
  renderizarLista();
}

function excluirContato(indice) {
  var confirmado = confirm("Tem certeza que deseja excluir o contato \"" + agenda.contatos[indice].nome + "\"?");
  if (!confirmado) return;

  agenda.contatos.splice(indice, 1);
  mostrarMensagem("Contato excluído.", "sucesso");
  limparFormulario();
  renderizarLista();
}

function editarContato(indice) {
  var c = agenda.contatos[indice];

  document.getElementById("nome").value       = c.nome;
  document.getElementById("telefone").value   = c.telefone;
  document.getElementById("email").value      = c.email;
  document.getElementById("nascimento").value = c.nascimento;
  document.getElementById("endereco").value   = c.endereco;
  document.getElementById("obs").value        = c.obs;

  document.getElementById("titulo-form").innerText = "Editando: " + c.nome;

  agenda.indiceEditando = indice;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
  document.getElementById("nome").value       = "";
  document.getElementById("telefone").value   = "";
  document.getElementById("email").value      = "";
  document.getElementById("nascimento").value = "";
  document.getElementById("endereco").value   = "";
  document.getElementById("obs").value        = "";

  document.getElementById("titulo-form").innerText = "Adicionar Contato";
  agenda.indiceEditando = -1;
}

function renderizarLista() {
  var termoBusca = document.getElementById("busca").value.toLowerCase();
  var ordenacao  = document.getElementById("ordenacao").value;
  var lista      = document.getElementById("lista-contatos");

  var contatosComIndice = agenda.contatos.map(function(c, i) {
    return { contato: c, indiceOriginal: i };
  });

  if (termoBusca !== "") {
    contatosComIndice = contatosComIndice.filter(function(item) {
      var c = item.contato;
      return (
        c.nome.toLowerCase().includes(termoBusca) ||
        c.telefone.includes(termoBusca) ||
        c.email.toLowerCase().includes(termoBusca)
      );
    });
  }

  if (ordenacao === "alfabetica") {
    contatosComIndice.sort(function(a, b) {
      return a.contato.nome.localeCompare(b.contato.nome);
    });
  } else if (ordenacao === "nascimento") {
    contatosComIndice.sort(function(a, b) {
      if (!a.contato.nascimento) return 1;
      if (!b.contato.nascimento) return -1;
      return a.contato.nascimento.localeCompare(b.contato.nascimento);
    });
  }

  document.getElementById("total-label").innerText = agenda.contatos.length + " contato(s)";

  if (contatosComIndice.length === 0) {
    lista.innerHTML = '<p id="sem-contatos">Nenhum contato encontrado.</p>';
    return;
  }

  var html = "";

  for (var i = 0; i < contatosComIndice.length; i++) {
    var item = contatosComIndice[i];
    var c    = item.contato;
    var idx  = item.indiceOriginal;

    var nascimentoFormatado = "";
    if (c.nascimento) {
      var partes = c.nascimento.split("-");
      nascimentoFormatado = partes[2] + "/" + partes[1] + "/" + partes[0];
    }

    html += '<div class="contato-card">';
    html +=   '<p class="contato-nome">' + escapeHTML(c.nome) + '</p>';
    html +=   '<p class="contato-info">Telefone: ' + escapeHTML(c.telefone) + '</p>';

    if (c.email)             html += '<p class="contato-info">E-mail: ' + escapeHTML(c.email) + '</p>';
    if (c.endereco)          html += '<p class="contato-info">Endereço: ' + escapeHTML(c.endereco) + '</p>';
    if (nascimentoFormatado) html += '<p class="contato-info">Nascimento: ' + nascimentoFormatado + '</p>';
    if (c.obs)               html += '<p class="contato-info">Obs: ' + escapeHTML(c.obs) + '</p>';

    html += '<div class="contato-acoes">';
    html +=   '<button class="btn-editar"  onclick="editarContato(' + idx + ')">Editar</button>';
    html +=   '<button class="btn-excluir" onclick="excluirContato(' + idx + ')">Excluir</button>';
    html += '</div>';
    html += '</div>';
  }

  lista.innerHTML = html;
}

function escapeHTML(texto) {
  var div = document.createElement("div");
  div.innerText = texto;
  return div.innerHTML;
}

function mostrarMensagem(texto, tipo) {
  var el = document.getElementById("msg-status");
  el.innerText     = texto;
  el.className     = tipo;
  el.style.display = "block";

  setTimeout(function() {
    el.style.display = "none";
  }, 3000);
}

document.getElementById("telefone").addEventListener("input", function() {
  var valor = this.value.replace(/\D/g, "");

  if (valor.length <= 10) {
    valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  this.value = valor;
});

document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();
});

renderizarLista();