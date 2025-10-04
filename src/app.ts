import * as readlineSync from 'readline-sync';

enum TipoAeronave { COMERCIAL = "Comercial", MILITAR = "Militar" }
enum TipoPeca { NACIONAL = "Nacional", IMPORTADA = "Importada" }
enum StatusPeca { EM_PRODUCAO = "Em Producao", EM_TRANSPORTE = "Em Transporte", PRONTA = "Pronta" }
enum StatusEtapa { PENDENTE = "Pendente", ANDAMENTO = "Em Andamento", CONCLUIDA = "Concluida" }
enum NivelPermissao { ADMINISTRADOR = "Admin", ENGENHEIRO = "Engenheiro", OPERADOR = "Operador" }
enum TipoTeste { ELETRICO = "Eletrico", HIDRAULICO = "Hidraulico", AERODINAMICO = "Aerodinamico" }
enum ResultadoTeste { APROVADO = "Aprovado", REPROVADO = "Reprovado" }

class Funcionario {
    constructor(
        public id: string,
        public nome: string,
        public telefone: string,
        public endereco: string,
        public usuario: string,
        public senha: string,
        public nivelPermissao: NivelPermissao
    ) {}

    autenticar(usuario: string, senha: string): boolean {
        return this.usuario === usuario && this.senha === senha;
    }
}

class Peca {
    constructor(
        public nome: string,
        public tipo: TipoPeca,
        public fornecedor: string,
        public status: StatusPeca = StatusPeca.EM_PRODUCAO
    ) {}

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
    }
}

class Etapa {
    public funcionarios: Funcionario[] = [];
    public status: StatusEtapa = StatusEtapa.PENDENTE;

    constructor(
        public nome: string,
        public prazo: string
    ) {}

    iniciarEtapa(): void {
        this.status = StatusEtapa.ANDAMENTO;
    }

    finalizarEtapa(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    associarFuncionario(funcionario: Funcionario): void {
        if (!this.funcionarios.find(f => f.id === funcionario.id)) {
            this.funcionarios.push(funcionario);
        }
    }

    listarFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }
}

class Teste {
    constructor(
        public tipo: TipoTeste,
        public resultado: ResultadoTeste
    ) {}
}

class Aeronave {
    public pecas: Peca[] = [];
    public etapas: Etapa[] = [];
    public testes: Teste[] = [];

    constructor(
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number
    ) {}

    adicionarPeca(peca: Peca): void {
        this.pecas.push(peca);
    }

    adicionarEtapa(etapa: Etapa): void {
        this.etapas.push(etapa);
    }

    adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }

    exibirDetalhes(): string {
        return `
AERONAVE ${this.codigo}
Modelo: ${this.modelo}
Tipo: ${this.tipo}
Capacidade: ${this.capacidade}
Alcance: ${this.alcance} km

PECAS:
${this.pecas.map(peca => `- ${peca.nome} (${peca.tipo}) - ${peca.status}`).join('\n')}

ETAPAS:
${this.etapas.map(etapa => `- ${etapa.nome} - ${etapa.status}`).join('\n')}

TESTES:
${this.testes.map(teste => `- ${teste.tipo}: ${teste.resultado}`).join('\n')}
        `;
    }
}

class AerocodeApp {
    private aeronaves: Aeronave[] = [];
    private funcionarios: Funcionario[] = [];
    private pecas: Peca[] = [];
    private etapas: Etapa[] = [];
    private usuarioLogado: Funcionario | null = null;

    constructor() {
        this.inicializarDados();
    }

    private inicializarDados(): void {
        const admin = new Funcionario("1", "Admin", "000000000", "Aerocode", "admin", "admin123", NivelPermissao.ADMINISTRADOR);
        this.funcionarios.push(admin);
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
            console.log("Login realizado! Bem-vindo, " + funcionario.nome);
        } else {
            console.log("Usuario ou senha incorretos!");
        }
    }

    private menuPrincipal(): void {
        console.log("\nMENU PRINCIPAL");
        console.log("1. Gerenciar Aeronaves");
        console.log("2. Gerenciar Pecas");
        console.log("3. Gerenciar Etapas");
        console.log("4. Gerenciar Funcionarios");
        console.log("5. Gerar Relatorio");
        console.log("6. Logout");
        console.log("0. Sair");

        const opcao = readlineSync.question("Opcao: ");

        switch (opcao) {
            case '1': this.menuAeronaves(); break;
            case '2': this.menuPecas(); break;
            case '3': this.menuEtapas(); break;
            case '4': this.menuFuncionarios(); break;
            case '5': this.gerarRelatorio(); break;
            case '6': this.usuarioLogado = null; console.log("Logout realizado!"); break;
            case '0': process.exit(0);
            default: console.log("Opcao invalida!");
        }
    }

    private menuAeronaves(): void {
        while (true) {
            console.log("\nGERENCIAR AERONAVES");
            console.log("1. Cadastrar Aeronave");
            console.log("2. Listar Aeronaves");
            console.log("3. Ver Detalhes");
            console.log("4. Voltar");

            const opcao = readlineSync.question("Opcao: ");

            switch (opcao) {
                case '1': this.cadastrarAeronave(); break;
                case '2': this.listarAeronaves(); break;
                case '3': this.verDetalhesAeronave(); break;
                case '4': return;
                default: console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarAeronave(): void {
        console.log("\nCADASTRAR AERONAVE");
        const codigo = readlineSync.question("Codigo: ");
        const modelo = readlineSync.question("Modelo: ");
        
        console.log("1. Comercial");
        console.log("2. Militar");
        const tipoOpcao = readlineSync.question("Tipo: ");
        const tipo = tipoOpcao === '1' ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;
        
        const capacidade = parseInt(readlineSync.question("Capacidade: "));
        const alcance = parseInt(readlineSync.question("Alcance: "));

        const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance);
        this.aeronaves.push(aeronave);

        console.log("Aeronave cadastrada!");
    }

    private listarAeronaves(): void {
        console.log("\nLISTA DE AERONAVES");
        if (this.aeronaves.length === 0) {
            console.log("Nenhuma aeronave.");
        } else {
            this.aeronaves.forEach(a => {
                console.log(`- ${a.codigo}: ${a.modelo} (${a.tipo})`);
            });
        }
    }

    private verDetalhesAeronave(): void {
        const codigo = readlineSync.question("Codigo da aeronave: ");
        const aeronave = this.aeronaves.find(a => a.codigo === codigo);
        
        if (aeronave) {
            console.log(aeronave.exibirDetalhes());
        } else {
            console.log("Aeronave nao encontrada!");
        }
    }

    private menuPecas(): void {
        while (true) {
            console.log("\nGERENCIAR PECAS");
            console.log("1. Cadastrar Peca");
            console.log("2. Listar Pecas");
            console.log("3. Atualizar Status");
            console.log("4. Voltar");

            const opcao = readlineSync.question("Opcao: ");

            switch (opcao) {
                case '1': this.cadastrarPeca(); break;
                case '2': this.listarPecas(); break;
                case '3': this.atualizarStatusPeca(); break;
                case '4': return;
                default: console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarPeca(): void {
        console.log("\nCADASTRAR PECA");
        const nome = readlineSync.question("Nome: ");
        
        console.log("1. Nacional");
        console.log("2. Importada");
        const tipoOpcao = readlineSync.question("Tipo: ");
        const tipo = tipoOpcao === '1' ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;
        
        const fornecedor = readlineSync.question("Fornecedor: ");

        this.pecas.push(new Peca(nome, tipo, fornecedor));
        console.log("Peca cadastrada!");
    }

    private listarPecas(): void {
        console.log("\nLISTA DE PECAS");
        if (this.pecas.length === 0) {
            console.log("Nenhuma peca.");
        } else {
            this.pecas.forEach((p, i) => {
                console.log(`${i+1}. ${p.nome} | ${p.tipo} | ${p.status}`);
            });
        }
    }

    private atualizarStatusPeca(): void {
        if (this.pecas.length === 0) {
            console.log("Nenhuma peca.");
            return;
        }

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
            console.log("Status atualizado!");
        } else {
            console.log("Numero invalido!");
        }
    }

    private menuEtapas(): void {
        while (true) {
            console.log("\nGERENCIAR ETAPAS");
            console.log("1. Criar Etapa");
            console.log("2. Listar Etapas");
            console.log("3. Iniciar Etapa");
            console.log("4. Finalizar Etapa");
            console.log("5. Associar Funcionario");
            console.log("6. Voltar");

            const opcao = readlineSync.question("Opcao: ");

            switch (opcao) {
                case '1': this.criarEtapa(); break;
                case '2': this.listarEtapas(); break;
                case '3': this.iniciarEtapa(); break;
                case '4': this.finalizarEtapa(); break;
                case '5': this.associarFuncionarioEtapa(); break;
                case '6': return;
                default: console.log("Opcao invalida!");
            }
        }
    }

    private criarEtapa(): void {
        console.log("\nCRIAR ETAPA");
        const nome = readlineSync.question("Nome: ");
        const prazo = readlineSync.question("Prazo (dd/mm/aaaa): ");

        this.etapas.push(new Etapa(nome, prazo));
        console.log("Etapa criada!");
    }

    private listarEtapas(): void {
        console.log("\nLISTA DE ETAPAS");
        if (this.etapas.length === 0) {
            console.log("Nenhuma etapa.");
        } else {
            this.etapas.forEach((e, i) => {
                console.log(`${i+1}. ${e.nome} | ${e.prazo} | ${e.status}`);
            });
        }
    }

    private iniciarEtapa(): void {
        if (this.etapas.length === 0) {
            console.log("Nenhuma etapa.");
            return;
        }

        this.listarEtapas();
        const index = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        if (index >= 0 && index < this.etapas.length) {
            const etapa = this.etapas[index];
            etapa.iniciarEtapa();
            console.log("Etapa iniciada!");
        } else {
            console.log("Numero invalido!");
        }
    }

    private finalizarEtapa(): void {
        if (this.etapas.length === 0) {
            console.log("Nenhuma etapa.");
            return;
        }

        this.listarEtapas();
        const index = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        if (index >= 0 && index < this.etapas.length) {
            const etapa = this.etapas[index];
            etapa.finalizarEtapa();
            console.log("Etapa finalizada!");
        } else {
            console.log("Numero invalido!");
        }
    }

    private associarFuncionarioEtapa(): void {
        if (this.etapas.length === 0 || this.funcionarios.length === 0) {
            console.log("Cadastre etapas e funcionarios primeiro!");
            return;
        }

        console.log("Etapas:");
        this.listarEtapas();
        const etapaIndex = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        console.log("Funcionarios:");
        this.funcionarios.forEach((f, i) => {
            console.log(`${i+1}. ${f.nome}`);
        });
        const funcIndex = parseInt(readlineSync.question("Numero do funcionario: ")) - 1;

        if (etapaIndex >= 0 && etapaIndex < this.etapas.length && 
            funcIndex >= 0 && funcIndex < this.funcionarios.length) {
            
            const etapa = this.etapas[etapaIndex];
            const funcionario = this.funcionarios[funcIndex];
            etapa.associarFuncionario(funcionario);
            console.log("Funcionario associado!");
        } else {
            console.log("Numeros invalidos!");
        }
    }

    private menuFuncionarios(): void {
        while (true) {
            console.log("\nGERENCIAR FUNCIONARIOS");
            console.log("1. Cadastrar Funcionario");
            console.log("2. Listar Funcionarios");
            console.log("3. Voltar");

            const opcao = readlineSync.question("Opcao: ");

            switch (opcao) {
                case '1': this.cadastrarFuncionario(); break;
                case '2': this.listarFuncionarios(); break;
                case '3': return;
                default: console.log("Opcao invalida!");
            }
        }
    }

    private cadastrarFuncionario(): void {
        console.log("\nCADASTRAR FUNCIONARIO");
        const id = readlineSync.question("ID: ");
        const nome = readlineSync.question("Nome: ");
        const telefone = readlineSync.question("Telefone: ");
        const endereco = readlineSync.question("Endereco: ");
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

        this.funcionarios.push(new Funcionario(id, nome, telefone, endereco, usuario, senha, nivel));
        console.log("Funcionario cadastrado!");
    }

    private listarFuncionarios(): void {
        console.log("\nLISTA DE FUNCIONARIOS");
        if (this.funcionarios.length === 0) {
            console.log("Nenhum funcionario.");
        } else {
            this.funcionarios.forEach(f => {
                console.log(`- ${f.nome} (${f.usuario}) - ${f.nivelPermissao}`);
            });
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
            console.log("Aeronave: " + aeronave.codigo);
            console.log("Cliente: " + cliente);
            console.log("Data entrega: " + dataEntrega);
            console.log(aeronave.exibirDetalhes());
            console.log("Relatorio gerado com sucesso!");
        } else {
            console.log("Numero invalido!");
        }
    }
}

const app = new AerocodeApp();
app.iniciar();