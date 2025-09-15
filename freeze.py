from flask_frozen import Freezer
from app import app, carregar_dados_plantas 

freezer = Freezer(app)

@freezer.register_generator
def planta_detalhe():
    print("Encontrando todas as plantas para gerar as páginas de detalhes...")
    plantas = carregar_dados_plantas()
    for planta in plantas:
        yield {'slug': planta['slug']}
    print(f"{len(plantas)} páginas de detalhes de plantas serão geradas.")

if __name__ == '__main__':
    print("Gerando a versão estática do site...")
    freezer.freeze() 
    print("Site estático gerado com sucesso na pasta 'build'!")