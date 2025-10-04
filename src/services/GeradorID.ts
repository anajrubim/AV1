export class GeradorID {
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
