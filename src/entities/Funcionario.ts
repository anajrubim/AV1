import { NivelPermissao } from "../enums/NiveisPermissao";

export class Funcionario {
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
