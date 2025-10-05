import * as fs from 'fs';
import * as path from 'path';
    
export class Armazenamento { 

    private static dataDir = __dirname.replace('services', "");

    static inicializar(): void {
        const dataPath = path.join(this.dataDir, 'data');
        const relPath = path.join(this.dataDir, 'relatorio');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }
        if (!fs.existsSync(relPath)) {
            fs.mkdirSync(relPath, { recursive: true });
        }
    }

    static salvar(nomeArquivo: string, dados: any): void {
        const caminho = path.join(this.dataDir, 'data', nomeArquivo);
        try {
            fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf8');
        } catch (err) {
            console.log(`Erro ao salvar ${nomeArquivo}:`, err);
        }
    }

    static carregar(nomeArquivo: string): any[] {
        const caminho = path.join(this.dataDir, 'data', nomeArquivo);
        try {
            if (fs.existsSync(caminho)) {
                const dados = fs.readFileSync(caminho, 'utf8');
                const parsed = JSON.parse(dados);
                return Array.isArray(parsed) ? parsed : parsed ?? [];
            }
        } catch (error) {
            console.log(`Erro ao carregar ${nomeArquivo}:`, error);
        }
        return [];
    }
}