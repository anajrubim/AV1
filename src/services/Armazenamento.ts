import * as fs from 'fs';
import * as path from 'path';

export class Armazenamento {
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
