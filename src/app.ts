import * as readlineSync from 'readline-sync';
import * as fs from 'fs';
import * as path from 'path';

import { Funcionario } from './entities/Funcionario';
import { Peca } from './entities/Peca';
import { Etapa } from './entities/Etapa';
import { Teste } from './entities/Teste';
import { Aeronave } from './entities/Aeronave';

import { TipoAeronave } from './enums/TiposAeronave';
import { TipoPeca } from './enums/TiposPeca';
import { StatusPeca } from './enums/StatusPeca';
import { StatusEtapa } from './enums/StatusEtapa';
import { NivelPermissao } from './enums/NiveisPermissao';
import { TipoTeste } from './enums/TiposTeste';
import { ResultadoTeste } from './enums/ResultadosTeste';

import { GeradorID } from './services/GeradorID';
import { Armazenamento } from './services/Armazenamento';

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

            if (this.verificarPermissao('cadastrar_peca')) {
                opcoes[opcaoNumero] = { texto: "Associar Peca", acao: () => this.associarPecaAeronave() };
                opcaoNumero++;
            }

            if (this.verificarPermissao('cadastrar_etapa')) {
                opcoes[opcaoNumero] = { texto: "Associar Etapa", acao: () => this.associarEtapaAeronave() };
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
        
        if (this.aeronaves.find(a => a.codigo === codigo)) {
            console.log("Erro: Codigo ja existe! Use outro codigo.");
            return;
        }
        
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
            console.log(`- ${a.codigo}: ${a.modelo} (${a.tipo}) - ${a.pecas.length} pecas, ${a.etapas.length} etapas`);
        });
    }

    private verDetalhesAeronave(): void {
        const codigo = readlineSync.question("Codigo da aeronave: ");
        const aeronave = this.aeronaves.find(a => a.codigo === codigo);
        
        if (aeronave) {
            console.log(aeronave.exibirDetalhes(this.pecas, this.etapas, this.funcionarios));
        } else {
            console.log("Aeronave nao encontrada!");
        }
    }

    private associarPecaAeronave(): void {
        if (this.aeronaves.length === 0 || this.pecas.length === 0) {
            console.log("Cadastre aeronaves e pecas primeiro!");
            return;
        }

        console.log("\nASSOCIAR PECA A AERONAVE");
        console.log("Aeronaves:");
        this.listarAeronaves();
        const aeroIndex = parseInt(readlineSync.question("Numero da aeronave: ")) - 1;

        console.log("Pecas disponiveis:");
        this.pecas.forEach((p, i) => {
            console.log(`${i+1}. ${p.nome} (${p.tipo}) - ${p.status}`);
        });
        const pecIndex = parseInt(readlineSync.question("Numero da peca: ")) - 1;

        if (aeroIndex >= 0 && aeroIndex < this.aeronaves.length && 
            pecIndex >= 0 && pecIndex < this.pecas.length) {
            
            const aeronave = this.aeronaves[aeroIndex];
            const peca = this.pecas[pecIndex];
            
            if (aeronave.pecas.includes(peca.id)) {
                console.log("Esta peca ja esta associada a esta aeronave!");
                return;
            }
            
            aeronave.adicionarPeca(peca.id);
            this.salvarTodosDados();
            console.log("Peca associada a aeronave!");
        } else {
            console.log("Numeros invalidos!");
        }
    }

    private associarEtapaAeronave(): void {
        if (this.aeronaves.length === 0 || this.etapas.length === 0) {
            console.log("Cadastre aeronaves e etapas primeiro!");
            return;
        }

        console.log("\nASSOCIAR ETAPA A AERONAVE");
        console.log("Aeronaves:");
        this.listarAeronaves();
        const aeroIndex = parseInt(readlineSync.question("Numero da aeronave: ")) - 1;

        console.log("Etapas disponiveis:");
        this.etapas.forEach((e, i) => {
            console.log(`${i+1}. ${e.nome} - ${e.status}`);
        });
        const etaIndex = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        if (aeroIndex >= 0 && aeroIndex < this.aeronaves.length && 
            etaIndex >= 0 && etaIndex < this.etapas.length) {
            
            const aeronave = this.aeronaves[aeroIndex];
            const etapa = this.etapas[etaIndex];
            
            if (aeronave.etapas.includes(etapa.id)) {
                console.log("Esta etapa ja esta associada a esta aeronave!");
                return;
            }
            
            aeronave.adicionarEtapa(etapa.id);
            this.salvarTodosDados();
            console.log("Etapa associada a aeronave!");
        } else {
            console.log("Numeros invalidos!");
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
            const aeronavesComPeca = this.aeronaves.filter(a => a.pecas.includes(p.id));
            const infoAeronaves = aeronavesComPeca.length > 0 ? 
                ` [Usada em ${aeronavesComPeca.length} aeronave(s)]` : ' [Nao associada]';
            console.log(`${i+1}. ${p.nome} (${p.tipo}) - ${p.status}${infoAeronaves}`);
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
        
        if (this.etapas.find(e => e.nome.toLowerCase() === nome.toLowerCase())) {
            console.log("Erro: Nome de etapa ja existe! Use outro nome.");
            return;
        }
        
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
            const aeronavesComEtapa = this.aeronaves.filter(a => a.etapas.includes(e.id));
            const funcionariosEtapa = e.funcionarios.length;
            const info = ` [${aeronavesComEtapa.length} aeronave(s), ${funcionariosEtapa} funcionario(s)]`;
            console.log(`${i+1}. ${e.nome} - ${e.status}${info}`);
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
        if (this.etapas.length === 0 || this.funcionarios.length === 0) {
            console.log("Cadastre etapas e funcionarios primeiro!");
            return;
        }

        console.log("\nASSOCIAR FUNCIONARIO A ETAPA");
        console.log("Etapas:");
        this.listarEtapas();
        const etapaIndex = parseInt(readlineSync.question("Numero da etapa: ")) - 1;

        console.log("Funcionarios:");
        this.funcionarios.forEach((f, i) => {
            console.log(`${i+1}. ${f.nome} (${f.nivelPermissao})`);
        });
        const funcIndex = parseInt(readlineSync.question("Numero do funcionario: ")) - 1;

        if (etapaIndex >= 0 && etapaIndex < this.etapas.length && 
            funcIndex >= 0 && funcIndex < this.funcionarios.length) {
            
            const etapa = this.etapas[etapaIndex];
            const funcionario = this.funcionarios[funcIndex];
            
            if (etapa.funcionarios.includes(funcionario.id)) {
                console.log("Este funcionario ja esta associado a esta etapa!");
                return;
            }
            
            etapa.associarFuncionario(funcionario.id);
            this.salvarTodosDados();
            console.log("Funcionario associado a etapa!");
        } else {
            console.log("Numeros invalidos!");
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
        
        if (this.funcionarios.find(f => f.usuario === usuario)) {
            console.log("Erro: Usuario ja existe! Escolha outro nome de usuario.");
            return;
        }
        
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
            const etapasComFuncionario = this.etapas.filter(e => e.funcionarios.includes(f.id));
            const infoEtapas = etapasComFuncionario.length > 0 ? 
                ` [Atua em ${etapasComFuncionario.length} etapa(s)]` : '';
            console.log(`- ${f.nome} (${f.usuario}) - ${f.nivelPermissao}${infoEtapas}`);
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
        if (this.aeronaves.length === 0) {
            console.log("❌ Cadastre aeronaves primeiro!");
            return;
        }

        console.log("\nREGISTRAR TESTE");
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
            console.log("Teste registrado na aeronave!");
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
            console.log(aeronave.exibirDetalhes(this.pecas, this.etapas, this.funcionarios));
        }
    }
}

const app = new AerocodeApp();
app.iniciar();
