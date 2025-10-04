import * as fs from 'fs';
import * as path from 'path';

export class GerenciadorArquivos {
    private static dataDir = 'data';

    static inicializarDiretorio(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
    }

    static salvarDados(nomeArquivo: string, dados: string): void {
        this.inicializarDiretorio();
        fs.writeFileSync(path.join(this.dataDir, nomeArquivo), dados, 'utf8');
    }

    static carregarDados(nomeArquivo: string): string {
        try {
            const caminho = path.join(this.dataDir, nomeArquivo);
            if (fs.existsSync(caminho)) {
                return fs.readFileSync(caminho, 'utf8');
            }
            return '';
        } catch (error) {
            return '';
        }
    }

    static listarArquivos(): string[] {
        this.inicializarDiretorio();
        return fs.readdirSync(this.dataDir);
    }
}