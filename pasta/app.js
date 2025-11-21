const pacientes = [];

const form = document.getElementById('formCadastro');
const nomeInput = document.getElementById('nome');
const arquivosInput = document.getElementById('arquivos');
const filePreview = document.getElementById('filePreview');
const listaPacientes = document.getElementById('listaPacientes');
const limparBtn = document.getElementById('limparBtn');

const modal = document.getElementById('modal');
const modalPaciente = document.getElementById('modalPaciente');
const obsInput = document.getElementById('obs');
const confirmStart = document.getElementById('confirmStart');
const cancelStart = document.getElementById('cancelStart');

let pacienteSelecionado = null;

arquivosInput.addEventListener('change', () => {
  const files = Array.from(arquivosInput.files || []);
  if (files.length === 0) {
    filePreview.textContent = '';
    return;
  }
  filePreview.textContent = files
    .map(f => `${f.name} (${formatBytes(f.size)})`)
    .join('\n');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  if (!nome) return alert('Por favor, informe o nome do paciente.');

  const files = Array.from(arquivosInput.files || []).map(f => ({
    name: f.name,
    size: f.size,
    type: f.type
  }));

  const novo = {
    id: cryptoRandomId(),
    nome,
    arquivos: files,
    criadoEm: new Date().toISOString(),
    avaliacoes: []
  };

  pacientes.unshift(novo);
  renderPatients();

  form.reset();
  filePreview.textContent = '';
  nomeInput.focus();
});

limparBtn.addEventListener('click', () => {
  form.reset();
  filePreview.textContent = '';
  nomeInput.focus();
});

function renderPatients() {
  listaPacientes.innerHTML = '';

  if (pacientes.length === 0) {
    listaPacientes.innerHTML =
      '<div class="patient">Nenhum paciente cadastrado ainda.</div>';
    return;
  }

  pacientes.forEach(p => {
    const item = document.createElement('div');
    item.className = 'patient';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('div');
    title.innerHTML = `<strong>${escapeHtml(p.nome)}</strong>`;

    const subtitle = document.createElement('div');
    subtitle.className = 'small muted';
    subtitle.textContent = `Cadastrado em ${new Date(p.criadoEm).toLocaleString()}`;

    meta.appendChild(title);
    meta.appendChild(subtitle);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const filesBtn = document.createElement('button');
    filesBtn.type = 'button';
    filesBtn.className = 'secondary';
    filesBtn.textContent = 'Ver arquivos';
    filesBtn.addEventListener('click', () => showFiles(p));

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.textContent = 'Iniciar Avaliação';
    startBtn.addEventListener('click', () => openModal(p));

    actions.appendChild(filesBtn);
    actions.appendChild(startBtn);

    item.appendChild(meta);
    item.appendChild(actions);

    listaPacientes.appendChild(item);
  });
}

function showFiles(p) {
  if (!p.arquivos || p.arquivos.length === 0) {
    alert('Nenhum arquivo anexado a este paciente.');
    return;
  }

  const list = p.arquivos
    .map(a => `${a.name} (${formatBytes(a.size)})`)
    .join('\n');

  alert(`Arquivos de ${p.nome}:\n\n${list}`);
}

function openModal(p) {
  pacienteSelecionado = p;
  modalPaciente.textContent = p.nome;
  obsInput.value = '';
  modal.classList.remove('hidden');
  obsInput.focus();
}

cancelStart.addEventListener('click', () => {
  pacienteSelecionado = null;
  modal.classList.add('hidden');
});

confirmStart.addEventListener('click', () => {
  if (!pacienteSelecionado) return;

  const observacoes = obsInput.value.trim();

  const avaliacao = {
    id: cryptoRandomId(),
    data: new Date().toISOString(),
    observacoes,
    status: 'iniciada'
  };

  pacienteSelecionado.avaliacoes.push(avaliacao);
  modal.classList.add('hidden');

  alert(`Avaliação iniciada para ${pacienteSelecionado.nome}.`);
  pacienteSelecionado = null;

  renderPatients();
});

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

function cryptoRandomId() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
    /[018]/g,
    c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":"&#39;"
  }[tag]));
}

renderPatients();
