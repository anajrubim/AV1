import * as readlineSync from 'readline-sync';
import * as fs from 'fs';
import * as path from 'path';

enum TipoAeronave { COMERCIAL = "Comercial", MILITAR = "Militar" }
enum TipoPeca { NACIONAL = "Nacional", IMPORTADA = "Importada" }
enum StatusPeca { EM_PRODUCAO = "Em Producao", EM_TRANSPORTE = "Em Transporte", PRONTA = "Pronta" }
enum StatusEtapa { PENDENTE = "Pendente", ANDAMENTO = "Em Andamento", CONCLUIDA = "Concluida" }
enum NivelPermissao { ADMINISTRADOR = "Admin", ENGENHEIRO = "Engenheiro", OPERADOR = "Operador" }
enum TipoTeste { ELETRICO = "Eletrico", HIDRAULICO = "Hidraulico", AERODINAMICO = "Aerodinamico" }
enum ResultadoTeste { APROVADO = "Aprovado", REPROVADO = "Reprovado" }

class GeradorID {
    private static contadores = { funcionario: 1, aeronave: 1, peca: 1, etapa: 1, teste: 1 };
    
    static gerar(tipo: keyof typeof GeradorID.contadores): string {
        return `${tipo.toUpperCase()}${this.contadores[tipo]++}`;
    }

    static inicializar(dadosExistentes: any): void {
        this.contadores.funcionario = this.obterProximoID(dadosExistentes.funcionarios);
        this.contadores.aeronave = this.obterProximoID(dadosExistentes.aeronaves);
        this.contadores.peca = this.obterProximoID(dadosExistentes.pecas);
        this.contadores.etapa = this.obterProximoID(dadosExistentes.etapas);
        this.contadores.teste = this.obterProximoID(dadosExistentes.testes);
    }

    private static obterProximoID(itens: any[]): number {
        if (!itens || itens.length === 0) return 1;
        
        const numeros = itens
            .map((item: any) => {
                const id = item.id;
                const match = id?.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            })
            .filter(num => num > 0);
        
        return numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    }
}

class Funcionario {
    constructor(
        public id: string,
        public nome: string,
        public usuario: string,
        public senha: string,
        public nivelPermissao: NivelPermissao
    ) {}

    autenticar(usuario: string, senha: string): boolean {
        return this.usuario === usuario && this.senha === senha;
    }

    temPermissao(funcionalidade: string): boolean {
        const permissoes: any = {
            'gerenciar_funcionarios': [NivelPermissao.ADMINISTRADOR],
            'cadastrar_aeronave': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'cadastrar_peca': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'cadastrar_etapa': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'associar_funcionarios': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'atualizar_status_peca': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR],
            'gerenciar_etapas': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR],
            'registrar_teste': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'gerar_relatorio': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO],
            'visualizar': [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR]
        };

        return permissoes[funcionalidade] ? permissoes[funcionalidade].includes(this.nivelPermissao) : false;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            usuario: this.usuario,
            senha: this.senha,
            nivelPermissao: this.nivelPermissao
        };
    }

    static fromJSON(json: any): Funcionario {
        return new Funcionario(
            json.id,
            json.nome,
            json.usuario,
            json.senha,
            json.nivelPermissao
        );
    }
}

class Peca {
    constructor(
        public id: string,
        public nome: string,
        public tipo: TipoPeca,
        public status: StatusPeca = StatusPeca.EM_PRODUCAO
    ) {}

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            tipo: this.tipo,
            status: this.status
        };
    }

    static fromJSON(json: any): Peca {
        return new Peca(
            json.id,
            json.nome,
            json.tipo,
            json.status
        );
    }
}

class Etapa {
    public funcionarios: string[] = [];
    public status: StatusEtapa = StatusEtapa.PENDENTE;
    
    constructor(public id: string, public nome: string) {}

    iniciarEtapa(): void {
        this.status = StatusEtapa.ANDAMENTO;
    }

    finalizarEtapa(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    associarFuncionario(funcionarioId: string): void {
        if (!this.funcionarios.includes(funcionarioId)) {
            this.funcionarios.push(funcionarioId);
        }
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            status: this.status,
            funcionarios: this.funcionarios
        };
    }

    static fromJSON(json: any): Etapa {
        const etapa = new Etapa(json.id, json.nome);
        etapa.status = json.status;
        etapa.funcionarios = json.funcionarios || [];
        return etapa;
    }
}

class Teste {
    constructor(
        public id: string,
        public tipo: TipoTeste,
        public resultado: ResultadoTeste
    ) {}

    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            resultado: this.resultado
        };
    }

    static fromJSON(json: any): Teste {
        return new Teste(
            json.id,
            json.tipo,
            json.resultado
        );
    }
}

class Aeronave {
    public pecas: string[] = [];
    public etapas: string[] = [];
    public testes: Teste[] = [];

    constructor(
        public id: string,
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number
    ) {}

    adicionarPeca(pecaId: string): void {
        if (!this.pecas.includes(pecaId)) {
            this.pecas.push(pecaId);
        }
    }

    adicionarEtapa(etapaId: string): void {
        if (!this.etapas.includes(etapaId)) {
            this.etapas.push(etapaId);
        }
    }

    adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }

    exibirDetalhes(pecasList: Peca[], etapasList: Etapa[]): string {
        const pecasDetalhes = this.pecas.map(pecaId => {
            const peca = pecasList.find(p => p.id === pecaId);
            return peca ? `- ${peca.nome} - ${peca.status}` : `- Peça ${pecaId} (não encontrada)`;
        }).join('\n');

        const etapasDetalhes = this.etapas.map(etapaId => {
            const etapa = etapasList.find(e => e.id === etapaId);
            return etapa ? `- ${etapa.nome} - ${etapa.status}` : `- Etapa ${etapaId} (não encontrada)`;
        }).join('\n');

        const testesDetalhes = this.testes.map(teste => 
            `- ${teste.tipo}: ${teste.resultado}`
        ).join('\n');

        return `
AERONAVE ${this.codigo}
Modelo: ${this.modelo}
Tipo: ${this.tipo}
Capacidade: ${this.capacidade}
Alcance: ${this.alcance} km

PECAS:
${pecasDetalhes}

ETAPAS:
${etapasDetalhes}

TESTES:
${testesDetalhes}`;
    }

    toJSON() {
        return {
            id: this.id,
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance,
            pecas: this.pecas,
            etapas: this.etapas,
            testes: this.testes.map(t => t.toJSON())
        };
    }

    static fromJSON(json: any): Aeronave {
        const aeronave = new Aeronave(
            json.id,
            json.codigo,
            json.modelo,
            json.tipo,
            json.capacidade,
            json.alcance
        );
        aeronave.pecas = json.pecas || [];
        aeronave.etapas = json.etapas || [];
        aeronave.testes = (json.testes || []).map((t: any) => Teste.fromJSON(t));
        return aeronave;
    }
}

class Armazenamento {
    private static dataDir = 'data';

    static inicializar(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
    }

    static salvar(nomeArquivo: string, dados: any): void {
        this.inicializar();
        const caminho = path.join(this.dataDir, nomeArquivo);
        fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    }

    static carregar(nomeArquivo: string): any {
        this.inicializar();
        const caminho = path.join(this.dataDir, nomeArquivo);
        try {
            if (fs.existsSync(caminho)) {
                const dados = fs.readFileSync(caminho, 'utf8');
                return JSON.parse(dados);
            }
        } catch (error) {
            console.log(`Erro ao carregar ${nomeArquivo}:`, error);
        }
        return [];
    }
}

class AerocodeApp {
    private aeronaves: Aeronave[] = [];
    private funcionarios: Funcionario[] = [];
    private pecas: Peca[] = [];
    private etapas: Etapa[] = [];
    private usuarioLogado: Funcionario | null = null;

    constructor() {
        this.carregarTodosDados();
        this.inicializarGeradorIDs();
        this.inicializarDados();
    }

    private carregarTodosDados(): void {
        this.funcionarios = Armazenamento.carregar('funcionarios.json').map((f: any) => Funcionario.fromJSON(f));
        this.pecas = Armazenamento.carregar('pecas.json').map((p: any) => Peca.fromJSON(p));
        this.etapas = Armazenamento.carregar('etapas.json').map((e: any) => Etapa.fromJSON(e));
        this.aeronaves = Armazenamento.carregar('aeronaves.json').map((a: any) => Aeronave.fromJSON(a));
    }

    private inicializarGeradorIDs(): void {
        const dadosExistentes = {
            funcionarios: this.funcionarios,
            aeronaves: this.aeronaves,
            pecas: this.pecas,
            etapas: this.etapas,
            testes: this.aeronaves.flatMap(a => a.testes)
        };
        GeradorID.inicializar(dadosExistentes);
    }

    private salvarTodosDados(): void {
        Armazenamento.salvar('funcionarios.json', this.funcionarios);
        Armazenamento.salvar('pecas.json', this.pecas);
        Armazenamento.salvar('etapas.json', this.etapas);
        Armazenamento.salvar('aeronaves.json', this.aeronaves);
    }

    private inicializarDados(): void {
        if (this.funcionarios.length === 0) {
            const admin = new Funcionario("FUNC1", "Administrador", "admin", "admin123", NivelPermissao.ADMINISTRADOR);
            const engenheiro = new Funcionario("FUNC2", "Engenheiro", "eng", "eng123", NivelPermissao.ENGENHEIRO);
            const operador = new Funcionario("FUNC3", "Operador", "op", "op123", NivelPermissao.OPERADOR);
            
            this.funcionarios.push(admin, engenheiro, operador);
            this.salvarTodosDados();
        }
    }

    private verificarPermissao(funcionalidade: string): boolean {
        if (!this.usuarioLogado) return false;
        return this.usuarioLogado.temPermissao(funcionalidade);
    }

    public iniciar(): void {
        console.log("SISTEMA AEROCODE");
        
        while (true) {
            if (!this.usuarioLogado) {
                this.telaLogin();
            } else {
                this.menuPrincipal();
            }
        }
    }

    private telaLogin(): void {
        console.log("LOGIN");
        const usuario = readlineSync.question("Usuario: ");
        const senha = readlineSync.question("Senha: ", { hideEchoBack: true });
        
        const funcionario = this.funcionarios.find(f => f.autenticar(usuario, senha));
        if (funcionario) {
            this.usuarioLogado = funcionario;
            console.log(`Bem-vindo, ${funcionario.nome} (${funcionario.nivelPermissao})`);
        } else {
            console.log("Usuario ou senha incorretos!");
        }
    }

    private menuPrincipal(): void {
        console.log(`\nMENU PRINCIPAL (${this.usuarioLogado?.nivelPermissao})`);
        
        let opcaoNumero = 1;
        const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

        if (this.verificarPermissao('visualizar')) {
            opcoes[opcaoNumero] = { texto: "Gerenciar Aeronaves", acao: () => this.menuAeronaves() };
            opcaoNumero++;
            
            opcoes[opcaoNumero] = { texto: "Gerenciar Pecas", acao: () => this.menuPecas() };
            opcaoNumero++;
            
            opcoes[opcaoNumero] = { texto: "Gerenciar Etapas", acao: () => this.menuEtapas() };
            opcaoNumero++;
        }

        if (this.verificarPermissao('gerenciar_funcionarios')) {
            opcoes[opcaoNumero] = { texto: "Gerenciar Funcionarios", acao: () => this.menuFuncionarios() };
            opcaoNumero++;
        }

        if (this.verificarPermissao('registrar_teste')) {
            opcoes[opcaoNumero] = { texto: "Registrar Testes", acao: () => this.menuTestes() };
            opcaoNumero++;
        }

        if (this.verificarPermissao('gerar_relatorio')) {
            opcoes[opcaoNumero] = { texto: "Gerar Relatorio", acao: () => this.gerarRelatorio() };
            opcaoNumero++;
        }

        opcoes[opcaoNumero] = { texto: "Logout", acao: () => { this.usuarioLogado = null; console.log("Logout realizado!"); } };
        opcaoNumero++;
        
        opcoes[opcaoNumero] = { texto: "Sair", acao: () => process.exit(0) };

        Object.keys(opcoes).forEach(num => {
            const opcao = opcoes[parseInt(num)];
            console.log(`${num}. ${opcao.texto}`);
        });

        const opcao = readlineSync.question("Opcao: ");
        const opcaoSelecionada = opcoes[parseInt(opcao)];

        if (opcaoSelecionada) {
            opcaoSelecionada.acao();
        } else {
            console.log("Opcao invalida!");
        }
    }

    private menuAeronaves(): void {
        while (true) {
            console.log(`\nAERONAVES (${this.usuarioLogado?.nivelPermissao})`);
            
            let opcaoNumero = 1;
            const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

            opcoes[opcaoNumero] = { texto: "Listar Aeronaves", acao: () => this.listarAeronaves() };
            opcaoNumero++;
            
            opcoes[opcaoNumero] = { texto: "Ver Detalhes", acao: () => this.verDetalhesAeronave() };
            opcaoNumero++;

            if (this.verificarPermissao('cadastrar_aeronave')) {
                opcoes[opcaoNumero] = { texto: "Cadastrar Aeronave", acao: () => this.cadastrarAeronave() };
                opcaoNumero++;
            }

            opcoes[opcaoNumero] = { texto: "Voltar", acao: () => {} };

            Object.keys(opcoes).forEach(num => {
                console.log(`${num}. ${opcoes[parseInt(num)].texto}`);
            });

            const opcao = readlineSync.question("Opcao: ");
            const opcaoSelecionada = opcoes[parseInt(opcao)];

            if (opcaoSelecionada) {
                if (opcaoSelecionada.texto === "Voltar") return;
                opcaoSelecionada.acao();
            } else {
                console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarAeronave(): void {
        console.log("\nCADASTRAR AERONAVE");
        const id = GeradorID.gerar("aeronave");
        const codigo = readlineSync.question("Codigo: ");
        const modelo = readlineSync.question("Modelo: ");
        
        console.log("1. Comercial");
        console.log("2. Militar");
        const tipoOpcao = readlineSync.question("Tipo: ");
        const tipo = tipoOpcao === '1' ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;
        
        const capacidade = parseInt(readlineSync.question("Capacidade: "));
        const alcance = parseInt(readlineSync.question("Alcance: "));

        this.aeronaves.push(new Aeronave(id, codigo, modelo, tipo, capacidade, alcance));
        this.salvarTodosDados();
        console.log("Aeronave cadastrada!");
    }

    private listarAeronaves(): void {
        console.log("\nAERONAVES:");
        if (this.aeronaves.length === 0) {
            console.log("Nenhuma aeronave cadastrada.");
            return;
        }
        this.aeronaves.forEach(a => {
            console.log(`- ${a.codigo}: ${a.modelo} (${a.tipo})`);
        });
    }

    private verDetalhesAeronave(): void {
        const codigo = readlineSync.question("Codigo da aeronave: ");
        const aeronave = this.aeronaves.find(a => a.codigo === codigo);
        
        if (aeronave) {
            console.log(aeronave.exibirDetalhes(this.pecas, this.etapas));
        } else {
            console.log("Aeronave nao encontrada!");
        }
    }

    private menuPecas(): void {
        while (true) {
            console.log(`\nPECAS (${this.usuarioLogado?.nivelPermissao})`);
            
            let opcaoNumero = 1;
            const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

            opcoes[opcaoNumero] = { texto: "Listar Pecas", acao: () => this.listarPecas() };
            opcaoNumero++;

            if (this.verificarPermissao('cadastrar_peca')) {
                opcoes[opcaoNumero] = { texto: "Cadastrar Peca", acao: () => this.cadastrarPeca() };
                opcaoNumero++;
            }

            if (this.verificarPermissao('atualizar_status_peca')) {
                opcoes[opcaoNumero] = { texto: "Atualizar Status", acao: () => this.atualizarStatusPeca() };
                opcaoNumero++;
            }

            opcoes[opcaoNumero] = { texto: "Voltar", acao: () => {} };

            Object.keys(opcoes).forEach(num => {
                console.log(`${num}. ${opcoes[parseInt(num)].texto}`);
            });

            const opcao = readlineSync.question("Opcao: ");
            const opcaoSelecionada = opcoes[parseInt(opcao)];

            if (opcaoSelecionada) {
                if (opcaoSelecionada.texto === "Voltar") return;
                opcaoSelecionada.acao();
            } else {
                console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarPeca(): void {
        console.log("\nCADASTRAR PECA");
        const id = GeradorID.gerar("peca");
        const nome = readlineSync.question("Nome: ");
        
        console.log("1. Nacional");
        console.log("2. Importada");
        const tipoOpcao = readlineSync.question("Tipo: ");
        const tipo = tipoOpcao === '1' ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;

        this.pecas.push(new Peca(id, nome, tipo));
        this.salvarTodosDados();
        console.log("Peca cadastrada!");
    }

    private listarPecas(): void {
        console.log("\nPECAS:");
        if (this.pecas.length === 0) {
            console.log("Nenhuma peca cadastrada.");
            return;
        }
        this.pecas.forEach((p, i) => {
            console.log(`${i+1}. ${p.nome} - ${p.status}`);
        });
    }

    private atualizarStatusPeca(): void {
        this.listarPecas();
        const index = parseInt(readlineSync.question("Numero da peca: ")) - 1;

        if (index >= 0 && index < this.pecas.length) {
            const peca = this.pecas[index];
            
            console.log("1. Em Producao");
            console.log("2. Em Transporte");
            console.log("3. Pronta");
            const statusOpcao = readlineSync.question("Novo status: ");
            
            let novoStatus: StatusPeca;
            switch (statusOpcao) {
                case '1': novoStatus = StatusPeca.EM_PRODUCAO; break;
                case '2': novoStatus = StatusPeca.EM_TRANSPORTE; break;
                case '3': novoStatus = StatusPeca.PRONTA; break;
                default: console.log("Status invalido!"); return;
            }

            peca.atualizarStatus(novoStatus);
            this.salvarTodosDados();
            console.log("Status atualizado!");
        }
    }

    private menuEtapas(): void {
        while (true) {
            console.log(`\nETAPAS (${this.usuarioLogado?.nivelPermissao})`);
            
            let opcaoNumero = 1;
            const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

            opcoes[opcaoNumero] = { texto: "Listar Etapas", acao: () => this.listarEtapas() };
            opcaoNumero++;

            if (this.verificarPermissao('cadastrar_etapa')) {
                opcoes[opcaoNumero] = { texto: "Criar Etapa", acao: () => this.criarEtapa() };
                opcaoNumero++;
            }

            if (this.verificarPermissao('gerenciar_etapas')) {
                opcoes[opcaoNumero] = { texto: "Iniciar Etapa", acao: () => this.iniciarEtapa() };
                opcaoNumero++;
                
                opcoes[opcaoNumero] = { texto: "Finalizar Etapa", acao: () => this.finalizarEtapa() };
                opcaoNumero++;
            }

            if (this.verificarPermissao('associar_funcionarios')) {
                opcoes[opcaoNumero] = { texto: "Associar Funcionario", acao: () => this.associarFuncionarioEtapa() };
                opcaoNumero++;
            }

            opcoes[opcaoNumero] = { texto: "Voltar", acao: () => {} };

            Object.keys(opcoes).forEach(num => {
                console.log(`${num}. ${opcoes[parseInt(num)].texto}`);
            });

            const opcao = readlineSync.question("Opcao: ");
            const opcaoSelecionada = opcoes[parseInt(opcao)];

            if (opcaoSelecionada) {
                if (opcaoSelecionada.texto === "Voltar") return;
                opcaoSelecionada.acao();
            } else {
                console.log("Opcao invalida!");
            }
        }
    }

    private criarEtapa(): void {
        console.log("\nCRIAR ETAPA");
        const id = GeradorID.gerar("etapa");
        const nome = readlineSync.question("Nome: ");
        this.etapas.push(new Etapa(id, nome));
        this.salvarTodosDados();
        console.log("Etapa criada!");
    }

    private listarEtapas(): void {
        console.log("\nETAPAS:");
        if (this.etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.");
            return;
        }
        this.etapas.forEach((e, i) => {
            console.log(`${i+1}. ${e.nome} - ${e.status}`);
        });
    }

    private iniciarEtapa(): void {
        this.listarEtapas();
        const index = parseInt(readlineSync.question("Numero da etapa: ")) - 1;
        if (index >= 0 && index < this.etapas.length) {
            this.etapas[index].iniciarEtapa();
            this.salvarTodosDados();
            console.log("Etapa iniciada!");
        }
    }

    private finalizarEtapa(): void {
        this.listarEtapas();
        const index = parseInt(readlineSync.question("Numero da etapa: ")) - 1;
        if (index >= 0 && index < this.etapas.length) {
            this.etapas[index].finalizarEtapa();
            this.salvarTodosDados();
            console.log("Etapa finalizada!");
        }
    }

    private associarFuncionarioEtapa(): void {
        this.listarEtapas();
        const etapaIndex = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        console.log("Funcionarios:");
        this.funcionarios.forEach((f, i) => {
            console.log(`${i+1}. ${f.nome} (${f.nivelPermissao})`);
        });
        const funcIndex = parseInt(readlineSync.question("Numero do funcionario: ")) - 1;

        if (etapaIndex >= 0 && etapaIndex < this.etapas.length && 
            funcIndex >= 0 && funcIndex < this.funcionarios.length) {
            
            this.etapas[etapaIndex].associarFuncionario(this.funcionarios[funcIndex].id);
            this.salvarTodosDados();
            console.log("Funcionario associado!");
        }
    }

    private menuFuncionarios(): void {
        while (true) {
            console.log(`\nFUNCIONARIOS (${this.usuarioLogado?.nivelPermissao})`);
            
            let opcaoNumero = 1;
            const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

            opcoes[opcaoNumero] = { texto: "Listar Funcionarios", acao: () => this.listarFuncionarios() };
            opcaoNumero++;
            
            opcoes[opcaoNumero] = { texto: "Cadastrar Funcionario", acao: () => this.cadastrarFuncionario() };
            opcaoNumero++;

            opcoes[opcaoNumero] = { texto: "Voltar", acao: () => {} };

            Object.keys(opcoes).forEach(num => {
                console.log(`${num}. ${opcoes[parseInt(num)].texto}`);
            });

            const opcao = readlineSync.question("Opcao: ");
            const opcaoSelecionada = opcoes[parseInt(opcao)];

            if (opcaoSelecionada) {
                if (opcaoSelecionada.texto === "Voltar") return;
                opcaoSelecionada.acao();
            } else {
                console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarFuncionario(): void {
        console.log("\nCADASTRAR FUNCIONARIO");
        const id = GeradorID.gerar("funcionario");
        const nome = readlineSync.question("Nome: ");
        const usuario = readlineSync.question("Usuario: ");
        const senha = readlineSync.question("Senha: ");
        
        console.log("1. Admin");
        console.log("2. Engenheiro");
        console.log("3. Operador");
        const nivelOpcao = readlineSync.question("Nivel: ");
        
        let nivel: NivelPermissao;
        switch (nivelOpcao) {
            case '1': nivel = NivelPermissao.ADMINISTRADOR; break;
            case '2': nivel = NivelPermissao.ENGENHEIRO; break;
            case '3': nivel = NivelPermissao.OPERADOR; break;
            default: nivel = NivelPermissao.OPERADOR;
        }

        this.funcionarios.push(new Funcionario(id, nome, usuario, senha, nivel));
        this.salvarTodosDados();
        console.log("Funcionario cadastrado!");
    }

    private listarFuncionarios(): void {
        console.log("\nFUNCIONARIOS:");
        this.funcionarios.forEach(f => {
            console.log(`- ${f.nome} (${f.usuario}) - ${f.nivelPermissao}`);
        });
    }

    private menuTestes(): void {
        while (true) {
            console.log(`\nTESTES (${this.usuarioLogado?.nivelPermissao})`);
            
            let opcaoNumero = 1;
            const opcoes: { [key: number]: { texto: string, acao: () => void } } = {};

            opcoes[opcaoNumero] = { texto: "Listar Aeronaves", acao: () => this.listarAeronaves() };
            opcaoNumero++;
            
            opcoes[opcaoNumero] = { texto: "Registrar Teste", acao: () => this.registrarTeste() };
            opcaoNumero++;

            opcoes[opcaoNumero] = { texto: "Voltar", acao: () => {} };

            Object.keys(opcoes).forEach(num => {
                console.log(`${num}. ${opcoes[parseInt(num)].texto}`);
            });

            const opcao = readlineSync.question("Opcao: ");
            const opcaoSelecionada = opcoes[parseInt(opcao)];

            if (opcaoSelecionada) {
                if (opcaoSelecionada.texto === "Voltar") return;
                opcaoSelecionada.acao();
            } else {
                console.log("Opcao invalida!");
            }
        }
    }

    private registrarTeste(): void {
        this.listarAeronaves();
        const aeroIndex = parseInt(readlineSync.question("Numero da aeronave: ")) - 1;

        console.log("Tipos de teste:");
        console.log("1. Eletrico");
        console.log("2. Hidraulico");
        console.log("3. Aerodinamico");
        const tipoOpcao = readlineSync.question("Tipo: ");
        
        let tipo: TipoTeste;
        switch (tipoOpcao) {
            case '1': tipo = TipoTeste.ELETRICO; break;
            case '2': tipo = TipoTeste.HIDRAULICO; break;
            case '3': tipo = TipoTeste.AERODINAMICO; break;
            default: console.log("Tipo invalido!"); return;
        }

        console.log("Resultado:");
        console.log("1. Aprovado");
        console.log("2. Reprovado");
        const resultadoOpcao = readlineSync.question("Resultado: ");
        const resultado = resultadoOpcao === '1' ? ResultadoTeste.APROVADO : ResultadoTeste.REPROVADO;

        if (aeroIndex >= 0 && aeroIndex < this.aeronaves.length) {
            const teste = new Teste(GeradorID.gerar("teste"), tipo, resultado);
            this.aeronaves[aeroIndex].adicionarTeste(teste);
            this.salvarTodosDados();
            console.log("Teste registrado!");
        }
    }

    private gerarRelatorio(): void {
        console.log("\nGERAR RELATORIO");
        
        if (this.aeronaves.length === 0) {
            console.log("Nenhuma aeronave.");
            return;
        }

        this.listarAeronaves();
        const index = parseInt(readlineSync.question("Numero da aeronave: ")) - 1;

        if (index >= 0 && index < this.aeronaves.length) {
            const aeronave = this.aeronaves[index];
            const cliente = readlineSync.question("Cliente: ");
            const dataEntrega = readlineSync.question("Data entrega: ");

            console.log("\nRELATORIO FINAL");
            console.log("Cliente: " + cliente);
            console.log("Data entrega: " + dataEntrega);
            console.log(aeronave.exibirDetalhes(this.pecas, this.etapas));
        }
    }
}

const app = new AerocodeApp();
app.iniciar();
